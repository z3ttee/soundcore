import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { WorkerJob, WorkerJobRef, WorkerQueue } from "@soundcore/nest-queue";
import { EVENT_FILES_FOUND, EVENT_FILES_PROCESSED, EVENT_TRIGGER_FILE_PROCESS_BY_FLAG } from "../../constants";
import { FilesFoundEvent } from "../../events/files-found.event";
import { FilesProcessedEvent } from "../../events/files-processed.event";
import { FileDTO } from "../../mount/dtos/file.dto";
import { Mount } from "../../mount/entities/mount.entity";
import { Environment } from "@soundcore/common";
import { FileProcessResultDTO } from "../dto/file-process-result.dto";
import { FileProcessDTO, FileProcessType } from "../dto/file-process.dto";

@Injectable()
export class FileQueueService {
    private readonly logger: Logger = new Logger(FileQueueService.name);

    constructor(
        private readonly queue: WorkerQueue<FileProcessDTO>,
        private readonly eventEmitter: EventEmitter2,
    ) {
        this.queue.on("failed", (job: WorkerJobRef<FileProcessDTO>, error: Error) => {
            if(Environment.isDebug) {
                this.logger.error(`Could not process batch of files for mount '${job.payload.mount?.name}': ${error?.message}`, error?.stack);
            } else {
                this.logger.error(`Could not process batch of files for mount '${job.payload.mount?.name}': ${error?.message}`);
            }
        })

        this.queue.on("started", (job: WorkerJob<FileProcessDTO, FileProcessResultDTO>) => {
            const { payload } = job;
            const { mount, type } = payload;

            if(type == FileProcessType.DEFAULT) {
                this.logger.verbose(`Creating database entries for files on mount '${mount.name}'`);
                return;
            }

            this.logger.verbose(`Checking for files that still await analysis.`);
        })

        this.queue.on("completed", (job: WorkerJob<FileProcessDTO, FileProcessResultDTO>) => {
            const { result, payload } = job;
            const { type } = payload || {};
            const { mount, timeTookMs = 0, filesProcessed = [] } = result || {};

            if(filesProcessed.length <= 0) {
                if(type == FileProcessType.DEFAULT) {
                    this.logger.verbose(`No new files were created on mount '${mount?.name}'. Took ${timeTookMs}ms.`);
                } else {
                    this.logger.verbose(`All files OK on mount '${mount?.name}'. Took ${timeTookMs}ms.`)
                }
                return;
            }
            
            if(type == FileProcessType.DEFAULT) {
                this.logger.verbose(`Created database entries for ${filesProcessed.length} files on mount '${mount?.name}'. Took ${timeTookMs}ms.`);
                this.eventEmitter.emit(EVENT_FILES_PROCESSED, new FilesProcessedEvent(filesProcessed, mount));
            } else {
                this.logger.verbose(`Found ${filesProcessed.length} files that still await analysis. Took ${timeTookMs}ms.`);
                this.eventEmitter.emit(EVENT_TRIGGER_FILE_PROCESS_BY_FLAG, new FilesProcessedEvent(filesProcessed));
            }

        })

        this.queue.on("progress", (job: WorkerJobRef<FileProcessDTO>) => {
            if(Environment.isDebug && job.payload.type != FileProcessType.FLAG_BASED) {
                this.logger.debug(`Progress on mount ${job.payload.mount?.name}: ${job.progress}%`);
            }
        })
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
        console.log("received files found event");
        this.processFiles(event.mount, event.files);
    }

    public async processAwaitingFiles() {
        const processDto = new FileProcessDTO(null, [], FileProcessType.FLAG_BASED);
        return this.queue.enqueue(processDto);
    }

    /**
     * Trigger the processing of a file. This will add the file
     * to a queue. The queue's processor creates all needed database entries, metadata etc.
     * @param mount Mount to which the files belong
     * @param files List of file objects of files that should be processed
     */
    private async processFiles(mount: Mount, files: FileDTO[]) {
        const processDto = new FileProcessDTO(mount, files);
        return this.queue.enqueue(processDto);
    }

}