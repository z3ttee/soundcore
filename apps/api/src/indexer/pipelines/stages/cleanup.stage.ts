import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import glob from "glob";
import { DataSource } from "typeorm";
import { Mount } from "../../../mount/entities/mount.entity";
import { FileSystemService } from "../../../filesystem/services/filesystem.service";
import { MountRegistryService } from "../../../mount/services/mount-registry.service";
import { MountRegistry } from "../../../mount/entities/mount-registry.entity";
import { FileDTO } from "../../../file/dto/file.dto";
import { Batch } from "@soundcore/common";
import { File, FileFlag } from "../../../file/entities/file.entity";
import { FileService } from "../../../file/services/file.service";
import { STAGE_SCAN_ID, STEP_CHECKOUT_MOUNT_ID, STEP_INDEX_FILES_ID, STEP_LOOKUP_FILES_ID } from "../../pipelines";
import { StepParams } from "@soundcore/pipelines";

export async function step_check_files(params: StepParams) {
    // Prepare step
    // const files: Map<string, File> = pipeline.read(STAGE_SCAN_ID)?.[STEP_INDEX_FILES_ID]?.files ?? new Map();

    // const succeededFiles: File[] = stage.read(STEP_CREATE_SONGS_ID)?.succeededFiles ?? [];
    // const failedFiles: File[] = stage.read(STEP_CREATE_SONGS_ID)?.failedFiles ?? [];
    // const duplicateFiles: File[] = stage.read(STEP_CREATE_SONGS_ID)?.duplicateFiles ?? [];

    // step.write("failed", failedFiles);
    // step.write("duplicates", duplicateFiles);
    // step.write("succeeded", succeededFiles);

    // console.log(files.size);
}

/**
 * Update status of failed files
 * @param step Current step to write result
 * @param datasource Datasource used for database connection
 * @param logger Logger instance
 */
export async function step_update_failed_files(params: StepParams) {
    // await Batch.useDataset(files).forEach(async (batch, currentBatch, totalBatches) => {
    //     step.progress(currentBatch/totalBatches);

    //     const repository = datasource.getRepository(File);
        
    //     await repository.createQueryBuilder().update()
    //         .set({ flag: FileFlag.ERROR })
    //         .whereInIds(batch.map((file) => file.id ))
    //         .execute().then((updateResult) => {
    //             logger.info(`Batch #${currentBatch}: Updated ${updateResult.affected}/${batch.length} files.`); 
    //         });

    //     return batch;
    // })
}

/**
 * Lookup files after the mount was checked-out.
 * @param stage Current pipeline stage to read result of previous step
 * @param step Current step to write results
 * @param env Environment
 * @param logger Logger instance
 */
export async function step_update_duplicate_files(params: StepParams) {
    // await Batch.useDataset(files).forEach(async (batch, currentBatch, totalBatches) => {
    //     step.progress(currentBatch/totalBatches);

    //     const repository = datasource.getRepository(File);
        
    //     await repository.createQueryBuilder().update()
    //         .set({ flag: FileFlag.POTENTIAL_DUPLICATE })
    //         .whereInIds(batch.map((file) => file.id ))
    //         .execute().then((updateResult) => {
    //             logger.info(`Batch #${currentBatch}: Updated ${updateResult.affected}/${batch.length} files.`); 
    //         });

    //     return batch;
    // });
}

/**
 * Create database entries for found files.
 * @param stage Current stage to read outputs from previous step
 * @param step Current step to write to outputs
 * @param env 
 * @param logger Logger instance
 */
export async function step_update_succeeded_files(params: StepParams) {


    // await Batch.useDataset(files).forEach(async (batch, currentBatch, totalBatches) => {
    //     step.progress(currentBatch/totalBatches);

    //     const repository = datasource.getRepository(File);
        
    //     await repository.createQueryBuilder().update()
    //         .set({ flag: FileFlag.OK })
    //         .whereInIds(batch.map((file) => file.id ))
    //         .execute().then((updateResult) => {
    //             logger.info(`Batch #${currentBatch}: Updated ${updateResult.affected}/${batch.length} files.`); 
    //         });

    //     return batch;
    // }).then(() => {
    //     logger.info(`Successfully updated files.`);
    // });
}