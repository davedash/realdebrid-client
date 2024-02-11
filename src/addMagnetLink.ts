import axios from "axios";
import { configCheck } from "./configCheck";
import { loadCredentials } from "./credentialsFile";
import type { CredentialFileData } from "./types";
import debug from "./debug";
export const addMagnetLink = async (magnetFile: string, types: string) => {
	await configCheck();
	const config = await loadCredentials();
	if (!config) {
		throw new Error("Credentials not loaded");
	}
	const magnetUrl = await Bun.file(magnetFile).text();
	const torrentId = await addMagnetToRealDebrid(config, magnetUrl);
	// const files = await getTorrentFiles(torrentId);
	// const filteredFiles = filterFilesByType(files, types);
};

import RDC from "node-real-debrid";

type File = {
	id: number;
	path: string;
};
const addMagnetToRealDebrid = async (
	credentials: CredentialFileData,
	magnetUrl: string,
) => {
	try {
		const tokens = await getTokens(credentials);
		const RD = new RDC(tokens.access_token);
		const response = await RD.torrents.addMagnet(magnetUrl);

		debug("Magnet response", response);

		const info = await RD.torrents.info(response.id);
		debug("Info response", info.files);

		const movieFiles = (info.files as File[]).filter(
			(file) => file.path.endsWith(".mp4") || file.path.endsWith(".mkv"),
		);
		const movieFileIds = movieFiles.map((file) => file.id);

		const select = await RD.torrents.selectFiles(
			response.id,
			movieFileIds.join(","),
		);
		return select; // This should include information about the added torrent
	} catch (error) {
		// @ts-expect-error
		console.error("Error adding magnet to Real Debrid:", error.message);
		debug({ error });
		throw error;
	}
};

interface TokenResponse {
	access_token: string;
	refresh_token: string;
	// Add any other relevant fields from the response
}

async function getTokens({
	clientId,
	clientSecret,
	deviceCode,
}: {
	clientId: string;
	clientSecret: string;
	deviceCode: string;
}): Promise<TokenResponse> {
	try {
		const response = await axios.post(
			"https://api.real-debrid.com/oauth/v2/token",
			{
				client_id: clientId,
				client_secret: clientSecret,
				code: deviceCode,
				grant_type: "http://oauth.net/grant_type/device/1.0",
			},
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			},
		);
		debug("Tokens:", response.data);

		return response.data;
	} catch (error) {
		// @ts-expect-error
		if (error.response) {
			// @ts-expect-error
			console.log(error.response.data);
		}

		// @ts-expect-error
		console.error("Error retrieving tokens:", error.message);
		throw error;
	}
}

// Usage example:
// getTokens('ABCDEFGHIJKLM', 'abcdefghsecret0123456789', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
//   .then(tokens => console.log(tokens))
//   .catch(error => console.error(error));
