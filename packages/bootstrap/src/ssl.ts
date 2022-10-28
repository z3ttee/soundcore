import path from "node:path";
import fs from "node:fs/promises";

import { HttpsOptions } from "@nestjs/common/interfaces/external/https-options.interface";
import { Logger } from "@nestjs/common";

export async function buildHttpsOptions(): Promise<HttpsOptions> {
    const logger: Logger = new Logger("SSL");

    const certFilepath: string = process.env.SSL_CERT_PEM ? path.resolve(process.env.SSL_CERT_PEM) : undefined;
    const keyFilepath: string = process.env.SSL_KEY_PEM ? path.resolve(process.env.SSL_KEY_PEM) : undefined;

    if(!certFilepath || !keyFilepath) {
        logger.warn(`Could not find SSL certificate or key file`);
        return null;
    }

    return fs.readFile(certFilepath).then((certBuffer) => {
        return fs.readFile(keyFilepath).then((keyBuffer) => {
            return {
                key: keyBuffer,
                cert: certBuffer
            }
        }).catch((error: Error) => {
            logger.error(`SSL privkey file was found ('${keyFilepath}'), but failed to read: ${error.message}`, error.stack);
            return null;
        });
    }).catch((error: Error) => {
        logger.error(`SSL cert file was found ('${certFilepath}'), but failed to read: ${error.message}`, error.stack);
        return null;
    });
}