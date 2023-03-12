import { Batch } from "@soundcore/common";
import { get, getOrDefault, getSharedOrDefault, progress, set, StepParams } from "@soundcore/pipelines";
import { DataSource } from "typeorm";
import { File, FileFlag } from "../../../file/entities/file.entity";
import { STAGE_CLEANUP_ID, STAGE_METADATA_ID, STEP_CHECK_FILES_ID, STEP_CREATE_SONGS_ID, STEP_INDEX_FILES_ID } from "../../pipelines";

export async function step_check_files(params: StepParams) {
    const { logger } = params;
    const files: Map<string, File> = getSharedOrDefault(`targetFiles`, new Map());

    const succeededFiles: string[] = [];
    const duplicateFiles: string[] = [];
    const failedFiles: string[] = [];

    logger.info(`Checking flags of ${files.size} files`);
    return Batch.useDataset(Array.from(files.values())).forEach((batch, current, total) => {

        for(const file of batch) {    
            if(file.flag == FileFlag.OK) {
                succeededFiles.push(file.id);
            } else if(file.flag == FileFlag.POTENTIAL_DUPLICATE) {
                duplicateFiles.push(file.id);
            } else if(file.flag == FileFlag.ERROR) {
                failedFiles.push(file.id);
            } else {
                // Mark as duplicate. If they are not failed, ok, or already marked as duplicate,
                // then this usually means, that the song has not been created without throwing error.
                // If there was actually an error with the query, than the file would have been marked failed.
    
                file.flag = FileFlag.POTENTIAL_DUPLICATE;
                duplicateFiles.push(file.id);
            }
        }

        progress(current/total);
        return batch;
    }).then(() => {
        logger.info(`Checked flags of ${files.size} files`);

        set("failed", failedFiles);
        set("duplicates", duplicateFiles);
        set("succeeded", succeededFiles);
    });
}

/**
 * Update status of failed files
 * @param step Current step to write result
 * @param datasource Datasource used for database connection
 * @param logger Logger instance
 */
export async function step_update_failed_files(params: StepParams) {
    const { logger, resources } = params;
    const datasource: DataSource = resources.datasource;
    const repository = datasource.getRepository(File);
    const fileIds: string[] = getOrDefault(`${STAGE_CLEANUP_ID}.${STEP_CHECK_FILES_ID}.failed`, []);

    return Batch.useDataset(fileIds).forEach((batch, currentBatch, totalBatches) => {
        progress(currentBatch/totalBatches);
    
        return repository.createQueryBuilder().update()
            .set({ flag: FileFlag.ERROR })
            .whereInIds(batch)
            .execute().then((updateResult) => {
                logger.info(`Batch #${currentBatch}: Updated ${updateResult.affected}/${batch.length} files.`); 
                return batch;
            });
    }).then(() => {
        logger.info(`Set status to 'ERROR' for ${fileIds.length} files`);
    });
}

/**
 * Lookup files after the mount was checked-out.
 * @param stage Current pipeline stage to read result of previous step
 * @param step Current step to write results
 * @param env Environment
 * @param logger Logger instance
 */
export async function step_update_duplicate_files(params: StepParams) {
    const { logger, resources } = params;
    const datasource: DataSource = resources.datasource;
    const repository = datasource.getRepository(File);
    const fileIds: string[] = getOrDefault(`${STAGE_CLEANUP_ID}.${STEP_CHECK_FILES_ID}.duplicates`, []);

    return Batch.useDataset(fileIds).forEach((batch, currentBatch, totalBatches) => {
        progress(currentBatch/totalBatches);
    
        return repository.createQueryBuilder().update()
            .set({ flag: FileFlag.POTENTIAL_DUPLICATE })
            .whereInIds(batch)
            .execute().then((updateResult) => {
                logger.info(`Batch #${currentBatch}: Updated ${updateResult.affected}/${batch.length} files.`); 
                return batch;
            });
    }).then(() => {
        logger.info(`Set status to 'DUPLICATE' for ${fileIds.length} files`);
    });
}

/**
 * Create database entries for found files.
 * @param stage Current stage to read outputs from previous step
 * @param step Current step to write to outputs
 * @param env 
 * @param logger Logger instance
 */
export async function step_update_succeeded_files(params: StepParams) {
    const { logger, resources } = params;
    const datasource: DataSource = resources.datasource;
    const repository = datasource.getRepository(File);
    const fileIds: string[] = getOrDefault(`${STAGE_CLEANUP_ID}.${STEP_CHECK_FILES_ID}.succeeded`, []);

    return Batch.useDataset(fileIds).forEach((batch, currentBatch, totalBatches) => {
        progress(currentBatch/totalBatches);
    
        return repository.createQueryBuilder().update()
            .set({ flag: FileFlag.OK })
            .whereInIds(batch)
            .execute().then((updateResult) => {
                logger.info(`Batch #${currentBatch}: Updated ${updateResult.affected}/${batch.length} files.`); 
                return batch;
            });
    }).then(() => {
        logger.info(`Set status to 'OK' for ${fileIds.length} files`);
    })
}