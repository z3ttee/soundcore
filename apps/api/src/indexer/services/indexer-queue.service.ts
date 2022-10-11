import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { WorkerJob, WorkerJobRef, WorkerQueue } from "@soundcore/nest-queue";
import path from "node:path";
import { EVENT_FILES_PROCESSED, EVENT_METADATA_CREATED } from "../../constants";
import { FilesProcessedEvent } from "../../events/files-processed.event";
import { File } from "../../file/entities/file.entity";
import { Mount } from "../../mount/entities/mount.entity";
import Debug from "../../utils/debug";
import { IndexerProcessDTO } from "../dtos/indexer-process.dto";
import { IndexerResultDTO } from "../dtos/indexer-result.dto";

@Injectable()
export class IndexerQueueService {
    private readonly logger: Logger = new Logger(IndexerQueueService.name);

    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly queue: WorkerQueue<IndexerProcessDTO>
    ) {

        this.queue.on("failed", (job: WorkerJobRef<IndexerProcessDTO>, error: Error) => {
            this.logger.error(`Failed analyzing metadata a file: ${error.message}`, error.stack);
        });

        this.queue.on("completed", (job: WorkerJob<IndexerProcessDTO, IndexerResultDTO>) => {
            const { result, payload: { files } } = job;
            const { entries, timeTookMs } = result;

            if(Debug.isDebug) {
                for(const entry of entries) {
                    this.logger.debug(`Successfully read metadata of file ${entry.filepath}. Took ${entry.timeTookMs}ms.`);
                }
            }
            
            // Print out results & stats
            const skippedFiles = files.length - entries.length;
            this.logger.verbose(`Successfully read metadata of ${entries.length} files.${skippedFiles > 0 ? ` Skipped ${skippedFiles} files.` : ''} Took ${timeTookMs}ms`);
            this.eventEmitter.emit(EVENT_METADATA_CREATED, result);
        });

        this.queue.on("progress", (job: WorkerJobRef<IndexerProcessDTO>) => {
            const { progress } = job;

            if(Debug.isDebug) {
                this.logger.debug(`Analyzing files: ${progress}`);
            }
        });
    }

    /**
     * Handle file processed events.
     * This event is emitted after a file has been processed
     * successfully by the fileService.
     * @param payload File object
     */
    @OnEvent(EVENT_FILES_PROCESSED)
    public handleFileProcessedEvent(event: FilesProcessedEvent) {
        this.queue.enqueue(new IndexerProcessDTO(event.files, event.mount))
    }

}