import fs from "node:fs/promises";
import { getConfigPath } from "./config";
import type { CredentialFileData } from "./types";

export const loadCredentials = async () => {
  const configPath = getConfigPath();
  if (await fs.exists(configPath)) {
    return JSON.parse(
      await fs.readFile(configPath, "utf8")
    ) as CredentialFileData;
  }
  return undefined;
};

export const saveCredentials = async (credentials: CredentialFileData) => {
  await Bun.write(getConfigPath(), JSON.stringify(credentials));
};
