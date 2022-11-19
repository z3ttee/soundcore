import { InternalServerErrorException, Logger } from "@nestjs/common";
import { Environment } from "@soundcore/common";
import { WorkerJobRef } from "@soundcore/nest-queue";
import { DataSource } from "typeorm";
import { ImportTask } from "../../import/entities/import.entity";
import { ImportService } from "../../import/services/import.service";
import Database from "../../utils/database/database-worker-client";
import { Janitor, JanitorRef, JanitorTask } from "../entities/janitor.entity";

export default async function (job: WorkerJobRef<Janitor>): Promise<any> {
    const janitor = job.payload;
    const task = janitor?.ref?.task;

    if(typeof janitor === "undefined" || janitor == null) {
        throw new InternalServerErrorException("Found invalid janitor instance in worker.");
    }

    return Database.connect().then(async (datasource) => {
        if(task == JanitorTask.CLEAR_ONGOING_IMPORTS) {
            return clearOngoingImports(datasource, janitor.ref);
        } else if(task == JanitorTask.CLEAR_OLD_IMPORTS) {
            return clearOldImports(datasource, janitor.ref);
        }
    });
}

/**
 * Clear ongoing imports. This will send a query which
 * sets the status for all imports (that where processing or enqueued)
 * @param datasource 
 * @param janitor 
 * @returns 
 */
async function clearOngoingImports(datasource: DataSource, janitor: JanitorRef) {
    const logger = new Logger(janitor.name);
    const startTimeMs = Date.now();

    logger.log(`Clearing all ongoing imports...`);

    const respository = datasource.getRepository(ImportTask);
    const service = new ImportService(respository);

    return service.clearOngoingImports().then((updateResult) => {
        const endTimeMs = Date.now();
        logger.log(`Cleared ${updateResult.affected ?? 0} ongoing import tasks. Took ${endTimeMs - startTimeMs}ms.`);
    }).catch((error: Error) => {
        if(!Environment.isDebug) {
            logger.error(`Failed clearing ongoing import tasks: ${error.message}`);
        } else {
            logger.error(`Failed clearing ongoing import tasks: ${error.message}`, error.stack);
        }
    });
}

/**
 * Clear ongoing imports. This will send a query which
 * sets the status for all imports (that where processing or enqueued)
 * @param datasource 
 * @param janitor 
 * @returns 
 */
 async function clearOldImports(datasource: DataSource, janitor: JanitorRef) {
    const logger = new Logger(janitor.name);
    const startTimeMs = Date.now();

    logger.log(`Clearing all imports older than 30days...`);

    const respository = datasource.getRepository(ImportTask);
    const service = new ImportService(respository);

    return service.clearOngoingImports().then((updateResult) => {
        const endTimeMs = Date.now();
        logger.log(`Cleared ${updateResult.affected ?? 0} old import tasks. Took ${endTimeMs - startTimeMs}ms.`);
    }).catch((error: Error) => {
        if(!Environment.isDebug) {
            logger.error(`Failed clearing old import tasks: ${error.message}`);
        } else {
            logger.error(`Failed clearing old import tasks: ${error.message}`, error.stack);
        }
    });
}