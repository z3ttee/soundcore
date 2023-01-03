import { Environment } from "@soundcore/common";
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { WorkerJob, WorkerJobRef, WorkerQueue } from "@soundcore/nest-queue";
import { EVENT_ALBUMS_CHANGED, EVENT_ARTISTS_CHANGED, EVENT_FILES_PROCESSED, EVENT_METADATA_CREATED, EVENT_SONGS_CHANGED, EVENT_SONG_CREATE_ARTWORK, EVENT_TRIGGER_FILE_PROCESS_BY_FLAG } from "../../constants";
import { FilesProcessedEvent } from "../../events/files-processed.event";
import { IndexerProcessDTO, IndexerProcessType } from "../dtos/indexer-process.dto";
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
            const { result, payload: { fileIds } } = job;
            const { entries, timeTookMs } = result || {};

            if(Environment.isDebug) {
                for(const entry of entries) {
                    this.logger.debug(`Successfully read metadata of file ${entry.filepath}. Took ${entry.timeTookMs}ms.`);
                }
            }
            
            // Print out results & stats
            const skippedFiles = fileIds.length - entries.length;
            this.logger.verbose(`Successfully read metadata of ${entries.length} files.${skippedFiles > 0 ? ` Skipped ${skippedFiles} files.` : ''} Took ${timeTookMs}ms`);

            // Emit events for meilisearch syncer
            this.eventEmitter.emit(EVENT_SONGS_CHANGED, result.createdResources.songs);
            this.eventEmitter.emit(EVENT_SONG_CREATE_ARTWORK, result.createdResources.artworks);
            this.eventEmitter.emit(EVENT_ALBUMS_CHANGED, result.createdResources.albums);
            this.eventEmitter.emit(EVENT_ARTISTS_CHANGED, result.createdResources.artists);
        });

        this.queue.on("progress", (job: WorkerJobRef<IndexerProcessDTO>) => {
            const { progress } = job;

            if(Environment.isDebug) {
                this.logger.debug(`Analyzing files: ${progress}`);
            }
        });

        this.queue.on("started", (job: WorkerJob<IndexerProcessDTO, IndexerResultDTO>) => {
            this.logger.verbose(`Starting analyzing id3 tags of ${job.payload.fileIds.length} files on mount '${job.payload.mount.name}'`);
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
        this.queue.enqueue(new IndexerProcessDTO(event.files, event.mount, IndexerProcessType.DEFAULT))
    }

    /**
     * Handle file processed events.
     * This event is emitted after a file has been processed
     * successfully by the fileService.
     * @param payload File object
     */
    //  @OnEvent(EVENT_TRIGGER_FILE_PROCESS_BY_FLAG)
    //  public handleFileProcessByFlagEvent(event: FilesProcessedEvent) {
    //      this.queue.enqueue(new IndexerProcessDTO(event.files,  IndexerProcessType.FLAG_BASED))
    //  }

}