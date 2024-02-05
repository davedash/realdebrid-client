import chalk from "chalk";
import { promptForCredentials } from "./config";
import Debug from "debug";
import { loadCredentials, saveCredentials } from "./credentialsFile";
import type { CredentialFileData } from "./types";

const debug = Debug("realdebrid");
export const configCheck = async (silent = true) => {
  let credentials: CredentialFileData | undefined = await loadCredentials();

  if (!credentials) {
    credentials = await promptForCredentials();
    await saveCredentials(credentials);
  }

  if (!silent) console.log(chalk.green("Credentials loaded successfully!"));
  return true;
};
