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

const addMagnetToRealDebrid = async (
	credentials: CredentialFileData,
	magnetUrl: string,
) => {
	try {
		const tokens = await getTokens(credentials);
		const response = await axios.post(
			"https://api.real-debrid.com/rest/1.0/torrents/addMagnet",
			{
				magnet: magnetUrl,
			},
			{
				headers: {
					Authorization: `Bearer ${tokens.access_token}`,
				},
			},
		);
		debug("Magnet response", response.data);
		return response.data; // This should include information about the added torrent
	} catch (error) {
		console.error("Error adding magnet to Real Debrid:", error);
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
			null,
			{
				params: {
					client_id: clientId,
					client_secret: clientSecret,
					code: deviceCode,
					grant_type: "http://oauth.net/grant_type/device/1.0",
				},
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			},
		);

		return response.data;
	} catch (error) {
		console.error("Error retrieving tokens:", error);
		throw error;
	}
}

// Usage example:
// getTokens('ABCDEFGHIJKLM', 'abcdefghsecret0123456789', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
//   .then(tokens => console.log(tokens))
//   .catch(error => console.error(error));
