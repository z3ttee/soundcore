import { Environment } from "@soundcore/common";
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { WorkerJob, WorkerJobRef, WorkerQueue } from "@soundcore/nest-queue";
import { EVENT_ALBUMS_CHANGED, EVENT_ARTISTS_CHANGED, EVENT_FILES_PROCESSED, EVENT_MOUNT_PROCESS_UPDATE, EVENT_SONGS_CHANGED, EVENT_SONG_CREATE_ARTWORK, MOUNT_MAX_STEPS } from "../../constants";
import { FilesProcessedEvent } from "../../events/files-processed.event";
import { IndexerProcessDTO, IndexerProcessType } from "../dtos/indexer-process.dto";
import { IndexerResultDTO } from "../dtos/indexer-result.dto";
import { MountProgress, MountProgressInfo, MountStatus } from "../../mount/entities/mount.entity";

const CURRENT_STEP = 3;
const STEP_INFO: MountProgressInfo = {
    title: "Extracting metadata",
    description: "Metadata is currently extracted from found files"
}

@Injectable()
export class IndexerQueueService {
    private readonly logger: Logger = new Logger(IndexerQueueService.name);

    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly queue: WorkerQueue<IndexerProcessDTO>
    ) {

        this.queue.on("failed", (job: WorkerJobRef<IndexerProcessDTO>, error: Error) => {
            const { payload: { mount } } = job;
            this.logger.error(`Failed analyzing metadata a file: ${error.message}`, error.stack);
            this.eventEmitter.emit(EVENT_MOUNT_PROCESS_UPDATE, mount, MountStatus.ERRORED, null);
        });

        this.queue.on("completed", (job: WorkerJob<IndexerProcessDTO, IndexerResultDTO>) => {
            const { result, payload: { fileIds, mount } } = job;
            const { entries, timeTookMs } = result || {};

            if(Environment.isDebug) {
                for(const entry of entries) {
                    this.logger.debug(`Successfully read metadata of file ${entry.filepath}. Took ${entry.timeTookMs}ms.`);
                }
            }
            
            // Print out results & stats
            const skippedFiles = fileIds.length - entries.length;
            this.logger.verbose(`Successfully read metadata of ${entries.length} files.${skippedFiles > 0 ? ` Skipped ${skippedFiles} files.` : ''} Took ${timeTookMs}ms`);

            if(typeof mount !== "undefined" && mount != null) {
                // All steps are completed with this one
                this.eventEmitter.emit(EVENT_MOUNT_PROCESS_UPDATE, mount, MountStatus.UP, null);
            }

            // Emit events for meilisearch syncer
            this.eventEmitter.emit(EVENT_SONGS_CHANGED, result.createdResources.songs);
            this.eventEmitter.emit(EVENT_SONG_CREATE_ARTWORK, result.createdResources.artworks);
            this.eventEmitter.emit(EVENT_ALBUMS_CHANGED, result.createdResources.albums);
            this.eventEmitter.emit(EVENT_ARTISTS_CHANGED, result.createdResources.artists);
        });

        this.queue.on("progress", (job: WorkerJobRef<IndexerProcessDTO>) => {
            const { payload: { mount }, progress } = job;

            if(Environment.isDebug) {
                this.logger.debug(`Analyzing files: ${progress}`);
            }

            this.eventEmitter.emit(EVENT_MOUNT_PROCESS_UPDATE, mount, MountStatus.BUSY, {
                mountId: mount.id,
                currentStep: CURRENT_STEP,
                maxSteps: MOUNT_MAX_STEPS,
                info: STEP_INFO,
                progress: progress
            } as MountProgress);
        });

        this.queue.on("started", (job: WorkerJob<IndexerProcessDTO, IndexerResultDTO>) => {
            const { payload: { mount, fileIds } } = job;
            this.logger.verbose(`Starting analyzing id3 tags of ${fileIds.length} files on mount '${mount.name}'`);

            this.eventEmitter.emit(EVENT_MOUNT_PROCESS_UPDATE, mount, MountStatus.BUSY, {
                mountId: mount.id,
                currentStep: CURRENT_STEP,
                maxSteps: MOUNT_MAX_STEPS,
                info: STEP_INFO,
                progress: -1
            } as MountProgress);
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