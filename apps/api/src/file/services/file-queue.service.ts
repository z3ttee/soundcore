import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { WorkerJob, WorkerJobRef, WorkerQueue } from "@soundcore/nest-queue";
import { EVENT_FILES_FOUND, EVENT_FILES_PROCESSED } from "../../constants";
import { FilesFoundEvent } from "../../events/files-found.event";
import { FileDTO } from "../dto/file.dto";
import { Mount } from "../../mount/entities/mount.entity";
import { Environment } from "@soundcore/common";
import { FileProcessResultDTO } from "../dto/file-process-result.dto";
import { FileProcessDTO, FileProcessFlag } from "../dto/file-process.dto";
import { MountScanFlag } from "../../mount/dtos/scan-process.dto";
import { FilesProcessedEvent } from "../../events/files-processed.event";

@Injectable()
export class FileQueueService {
    private readonly logger: Logger = new Logger(FileQueueService.name);

    constructor(
        private readonly queue: WorkerQueue<FileProcessDTO>,
        private readonly eventEmitter: EventEmitter2
    ) {
        this.queue.on("failed", (job: WorkerJobRef<FileProcessDTO>, error: Error) => this.handleOnWorkerFailed(job, error));
        this.queue.on("progress", (job: WorkerJobRef<FileProcessDTO>) => this.handleOnWorkerProgress(job));
        this.queue.on("started", (job: WorkerJob<FileProcessDTO, FileProcessResultDTO[]>) => this.handleOnWorkerStarted(job));
        this.queue.on("completed", (job: WorkerJob<FileProcessDTO, FileProcessResultDTO[]>) => this.handleOnWorkerCompleted(job));
    }

    /**
     * Handle file found event.
     * This event is emitted by the mount service, after a new 
     * file was found.
     * @param file Found file data
     * @param workerOptions Worker options
     */
    @OnEvent(EVENT_FILES_FOUND)
    public handleFilesFoundEvent(event: FilesFoundEvent) {
        this.processFiles(event.mount, event.files, event.flag);
    }

    public async processAwaitingFiles() {
        return this.processFiles(null, [], MountScanFlag.DEFAULT_SCAN, FileProcessFlag.CONTINUE_AWAITING)
    }

    /**
     * Trigger the processing of a file. This will add the file
     * to a queue. The queue's processor creates all needed database entries, metadata etc.
     * @param mount Mount to which the files belong
     * @param files List of file objects of files that should be processed
     */
    private async processFiles(mount: Mount, files: FileDTO[], scanFlag: MountScanFlag, flag: FileProcessFlag = FileProcessFlag.DEFAULT) {
        const processDto = new FileProcessDTO(mount, files, scanFlag, flag);
        return this.queue.enqueue(processDto);
    }

    /**
     * Handle worker started event
     */
    private async handleOnWorkerStarted(job: WorkerJob<FileProcessDTO, FileProcessResultDTO[]>) {
        const { payload } = job;
        const { mount, flag } = payload;

        if(flag == FileProcessFlag.DEFAULT) {
            this.logger.verbose(`Creating database entries for files on mount '${mount.name}'`);
        } else {
            this.logger.verbose(`Checking for files that await analysis...`);
        }
    }

    /**
     * Handle worker failed event
     */
    private async handleOnWorkerFailed(job: WorkerJobRef<FileProcessDTO>, error: Error) {
        const { mount, flag } = job.payload;

        if(flag == FileProcessFlag.DEFAULT) {
            if(Environment.isDebug) {
                this.logger.error(`Could not process batch of files for mount '${mount?.name}': ${error?.message}`, error?.stack);
            } else {
                this.logger.error(`Could not process batch of files for mount '${mount?.name}': ${error?.message}`);
            }
        } else {
            if(Environment.isDebug) {
                this.logger.error(`Failed checking for file that await analysis: ${error.message}`, error.stack)
            } else {
                this.logger.error(`Failed checking for file that await analysis: ${error.message}`)
            }
        }
    }

    /**
     * Handle worker completed event
     */
    private async handleOnWorkerCompleted(job: WorkerJob<FileProcessDTO, FileProcessResultDTO[]>) {
        const { result } = job;

        for(const res of result) {
            const { timeTookMs = 0, filesProcessed = [] } = res || {};
            const { flag, mount, scanFlag } = res;

            if(flag == FileProcessFlag.DEFAULT) {
                if(filesProcessed.length <= 0) {
                    this.logger.verbose(`No new files were created on mount '${mount?.name}'. Took ${timeTookMs}ms.`);
                    return;
                }
        
                this.logger.verbose(`Created database entries for ${filesProcessed.length} files on mount '${mount?.name}'. Took ${timeTookMs}ms.`);
            } else {
                if(filesProcessed.length <= 0) {
                    this.logger.verbose(`No waiting files found. Took ${timeTookMs}ms.`);
                    return;
                }
        
                this.logger.verbose(`${filesProcessed.length} files have been enqueued for analysis. Took ${timeTookMs}ms.`);
            }

            // Emit event for the next step
            this.eventEmitter.emit(EVENT_FILES_PROCESSED, new FilesProcessedEvent(filesProcessed, mount, scanFlag));
        }
    }

    /**
     * Handle worker progress event
     */
    private async handleOnWorkerProgress(job: WorkerJobRef<FileProcessDTO>) {
        if(Environment.isDebug) {
            this.logger.debug(`Progress on mount ${job.payload.mount?.name}: ${job.progress}%`);
        }
    }

}