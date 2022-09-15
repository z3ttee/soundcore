import { Logger } from "@nestjs/common";
import { DoneCallback, Job } from "bull";
import path from "path";
import fs from "fs";
import { FileProcessDTO, FileProcessMode } from "../dto/file-process.dto";
import { File } from "../entities/file.entity";
import { DBWorker } from "../../utils/workers/worker.util";
import { FileService } from "../services/file.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

const logger = new Logger("FileWorker")

// TODO: Add a version checker. So if there are enqueued tasks, but the version
// changes, it can cause unexpected behaviour

export default function (job: Job<FileProcessDTO>, cb: DoneCallback) {    
    const startTime = Date.now();

    const mode = job.data.mode;
    const file = job.data.file;
    const mount = job.data.file.mount;
    const filepath = path.join(mount.directory, file.directory || ".", file.filename);

    // Get file stats
    fs.stat(filepath, (err, stat) => {
        file.size = stat?.size || 0;

        if(err) {
            logger.warn(`Could not get filesystem information for file '${filepath}': ${err.message}`);
        }

        DBWorker.instance().then((worker) => {
            worker.establishConnection().then((dataSource) => {
                const service = new FileService(dataSource.getRepository(File), new EventEmitter2(), null);

                // TODO: Use ffprobe to check file codec_type = "audio" and codec_name = "mp3"
                service.findOrCreateFile(file).then((result) => {
                    if(result.existed && mode == FileProcessMode.SCAN) {
                        // logger.warn(`Worker received file that was scanned already and is now tried to be rescanned using a wrong processing mode (${mode} (SCAN), expected: ${FileProcessMode.RESCAN} (RESCAN)). This usually means, the previous step on scanning the directory did not filter out all existing files. A reason for this can be unusual file path names, that are incorrectly escaped by the underlying glob library. There is no fix available besides renaming the file's path and filtering out possible illegal characters.`)
                        reportError(job, null, cb);
                        return;
                    }
                    logger.verbose(`Started processing file '${filepath}'`);
    
                    reportSuccess(startTime, job, result.data, cb);
                }).catch((error) => {
                    reportError(job, error, cb);
                });
            }).catch((error: Error) => {
                // Handle error
                reportError(job, error, cb);
            });
        });
    });
}

/**
 * Report success by calling the DoneCallback.
 * @param startTime Time in ms when the job was started.
 * @param job Job data
 * @param result Result to be passed to DoneCallback
 * @param cb DoneCallback
 */
function reportSuccess(startTime: number, job: Job<FileProcessDTO>, result: File, cb: DoneCallback) {
    const file = job.data.file;
    const filepath = path.join(file.mount.directory, file.directory, file.filename);

    logger.verbose(`Processed file '${filepath}' in ${Date.now()-startTime}ms.`);
    cb(null, result);
}

/**
 * Report the error to the log.
 * This will create log entries as well as execute the DoneCallback
 * passing in the error and null as the job's result.
 * @param job Job where the error occured
 * @param error Error that has occured
 * @param cb DoneCallback
 */
 function reportError(job: Job<FileProcessDTO>, error: Error, cb: DoneCallback) {
    cb(error, null);
}