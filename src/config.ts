import chalk from "chalk";
import * as os from "os";
import * as path from "path";
import { checkDeviceCode, getDeviceCode } from "./credentials";

export const getConfigPath = () => {
	return path.join(os.homedir(), ".config", "realdebrid", "credentials.json");
};

export const promptForCredentials = async () => {
	console.log(chalk.yellow("Real Debrid credentials not found."));
	const { deviceCode, interval, timeout } = await getDeviceCode();
	const tokens = await checkDeviceCode(deviceCode, interval, timeout);
	return tokens;
};
