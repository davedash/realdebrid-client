import fs from "node:fs/promises";
import { getConfigPath } from "./config";
import Debug from "debug";
import axios from "axios";
import { sleep } from "bun";

const debug = Debug("realdebrid");

/**
 * Client ID for Open Source RD Clients
 *
 * @see https://api.real-debrid.com
 */
const CLIENT_ID = "X245A4XAIBGVM";

export const getDeviceCode = async () => {
  try {
    const response = await axios.get(
      "https://api.real-debrid.com/oauth/v2/device/code",
      {
        params: {
          client_id: CLIENT_ID,
          new_credentials: "yes",
        },
      }
    );

    const {
      user_code,
      device_code: deviceCode,
      interval,
      expires_in: timeout,
      verification_url,
    } = response.data;

    console.log(
      `Please go to ${verification_url} and enter the code: ${user_code}`
    );
    console.log(
      `Code expires in ${
        timeout / 60
      } minutes. Checking every ${interval} seconds for validation...`
    );

    return { deviceCode, interval, timeout };
  } catch (error) {
    console.error("Error getting device code:", error);
    throw error; // Or handle error as needed
  }
};

export async function checkDeviceCode(
  deviceCode: string,
  interval: number,
  timeoutInSeconds: number
) {
  debug("Checking device code with a timeout of", timeoutInSeconds);
  const startTime = Date.now();

  while (true) {
    try {
      debug("Checking for code", deviceCode);
      const response = await axios.get(
        "https://api.real-debrid.com/oauth/v2/device/credentials",
        {
          params: {
            client_id: CLIENT_ID,
            code: deviceCode,
          },
        }
      );

      if (response.data) {
        // Device is authorized
        console.log("Device authorized!");
        const res = {
          deviceCode,
          clientId: response.data.client_id,
          clientSecret: response.data.client_secret,
        };
        return res; // Contains access_token and refresh_token
      }
    } catch (error) {
      if (Date.now() - startTime > timeoutInSeconds * 1000) {
        throw new Error("Authorization timeout");
      }

      // @ts-expect-error
      debug("Unknown error", error.message);
      // If it's an expected error (like "Pending" status), just ignore and continue polling
    }

    await sleep(interval * 1000); // Convert interval to milliseconds
  }
}
