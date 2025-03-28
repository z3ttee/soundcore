import fs from "node:fs";
import path from "node:path";
import { ENV_CLIENT_SECRET_KEY, FILE_SERVICE_INFO } from "../constants";
import { ServiceInfo } from "../entities/service-info.entity";
import { MissingServiceInfoFileException } from "../exceptions/missingServiceInfo";
import logger from "./logger";
import { isNull } from "@repo/utilities";

/**
 * Read the service info file of
 * a microservice
 * @throws `MissingServiceInfoFileException` When the service info file cannot be found
 * @throws `MissingClientSecretException` When the client_secret is missing on process env
 * @returns Instance of the service info entity
 */
export async function readServiceInfo(): Promise<ServiceInfo> {
  return readServiceInfoSync();
}

/**
 * Read the service info file of
 * a microservice
 * @throws Throws an error if the service file cannot be read
 * @throws `MissingServiceInfoFileException` When the service info file cannot be found
 * @throws `MissingClientSecretException` When the client_secret is missing on process env
 * @returns Instance of the service info entity
 */
export function readServiceInfoSync(): ServiceInfo {
  const filepath = path.join(process.cwd(), FILE_SERVICE_INFO);

  // Check if file exists
  if (!fs.existsSync(filepath)) {
    throw new MissingServiceInfoFileException(filepath);
  }

  try {
    const fileData = fs.readFileSync(filepath);
    const jsonData: Record<keyof Omit<ServiceInfo, "client_secret">, string> = JSON.parse(fileData.toString());
    const client_secret: string | undefined = process.env[ENV_CLIENT_SECRET_KEY];

    return Object.assign(
      new ServiceInfo(
        jsonData.client_id,
        jsonData.client_name,
        jsonData.client_version,
        client_secret ? Buffer.from(client_secret, "base64").toString() : undefined
      )
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed reading ${filepath}: ${error.message}`);
    } else {
      throw new Error(`Failed reading ${filepath}: ${error}`);
    }
  }
}
