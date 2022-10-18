import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

import { Logger } from "@nestjs/common";
import { FileProcessDTO } from "../dto/file-process.dto";
import { File } from "../entities/file.entity";
import { WorkerJobRef, WorkerProgressEvent } from "@soundcore/nest-queue";
import workerpool from "workerpool";
import Database from "../../utils/database/database-worker-client";
import { FileService } from "../services/file.service";
import { FileProcessResultDTO } from "../dto/file-process-result.dto";

const logger = new Logger("FileWorker")
const BATCH_SIZE = 100;

export default async function (job: WorkerJobRef<FileProcessDTO>): Promise<FileProcessResultDTO> {
    return Database.connect().then(async (dataSource) => {
        const service = new FileService(dataSource.getRepository(File));
        
        const { mount, files } = job.payload;
        const startTime = Date.now();
    
        const results: File[] = [];
        let length = files.length;
        let currentBatch = 0;
        const batches = Math.round(length / BATCH_SIZE);
    
        // Split arrays in batches of BATCH_SIZE entries
        while (length) {
            currentBatch++;

            // If there are no BATCH_SIZE entries left, use current length
            const size = length >= BATCH_SIZE ? BATCH_SIZE : length;
            const batch = files.splice(0, size);
            const batchResults: File[] = [];
            
            // Process batch by looping through every entry
            let batchLength = batch.length;
            while (batchLength > 0) {
                batchLength--;

                // Note: The batch is processed in reverse order,
                // because the length is decremented
                const fileDto = batch[batchLength];
                const filepath = path.join(mount.directory, fileDto.directory || ".", fileDto.filename);

                try {
                    // Get file stats
                    const stats = fs.statSync(filepath, { throwIfNoEntry: true });
                    if(!stats) logger.warn(`Could not get file stats for '${filepath}'.`);

                    // Create file entity
                    const file = new File();
                    file.name = fileDto.filename;
                    file.directory = fileDto.directory;
                    file.mount = mount;
                    file.size = stats?.size || 0;

                    // Calculate hash consisting of information
                    // that make the file unique
                    const pathToHash = `${mount.id}:${file.directory}:${file.name}:${file.size}`;
                    file.pathHash = crypto.createHash("md5").update(pathToHash, "binary").digest("hex");

                    batchResults.push(file);
                } catch (error) {
                    logger.warn(`Skipping file file ${filepath} because it could not be analyzed: ${error["message"] || error}`);
                    continue;
                }
            }


            // Create database entries
            await service.createFiles(batchResults).then((result) => {
                // Update job progress
                job.progress = Math.round((currentBatch / batches) * 100);

                // Emit progress update
                workerpool.workerEmit(new WorkerProgressEvent(job));

                // Add created files to result
                results.push(...result);
            }).catch((error: Error) => {
                logger.error(`Error occured whilst processing batch ${currentBatch}: ${error.message}`, error.stack);
            });
    
            // Decrement length to process next batch
            length -= size;
        }
    
        const timeTookMs = Date.now() - startTime;
        return new FileProcessResultDTO(mount, results, timeTookMs);
    });
}