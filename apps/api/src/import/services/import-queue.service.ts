import { Injectable, Logger } from "@nestjs/common";
import { Environment } from "@soundcore/common";
import { WorkerJob, WorkerJobRef, WorkerQueue } from "@soundcore/nest-queue";
import { ImportTaskUpdateEvent } from "../../gateway/events/importtask-update.event";
import { GeneralGateway } from "../../gateway/gateways/general-gateway.gateway";
import { ImportTask, ImportTaskStatus, ImportTaskType } from "../entities/import.entity";
import { ImportSpotifyResult } from "../entities/spotify-import.entity";
import { ImportService } from "./import.service";

@Injectable()
export class ImportQueueService {
    private readonly logger = new Logger(ImportQueueService.name);

    constructor(
        private readonly gateway: GeneralGateway,
        private readonly queue: WorkerQueue<ImportTask>,
        private readonly service: ImportService
    ) {

        this.queue.on("started", (job: WorkerJob<ImportTask>) => {
            this.updateImportTask(job.payload, ImportTaskStatus.PROCESSING);
            this.logger.verbose(`Importing data from url '${job.payload.url}'. Initiated by user ${job.payload.user.name}`);
        });

        this.queue.on("completed", (job: WorkerJob<ImportTask>) => {
            this.updateImportTask(job.payload, ImportTaskStatus.OK);

            // Do some logging
            if(job.payload.type == ImportTaskType.SPOTIFY_PLAYLIST) {
                const result = job.result as ImportSpotifyResult;
                this.logger.verbose(`Successfully imported playlist '${result.playlist.name}' from Spotify. Found ${result.stats.importedAmount}/${result.stats.total} songs. Took ${result.stats.timeTookMs}ms.`);
            }
        });

        this.queue.on("failed", (job: WorkerJobRef<ImportTask>, error: Error) => {
            this.updateImportTask(job.payload, ImportTaskStatus.ERRORED);

            // Do some logging
            if(Environment.isDebug) {
                this.logger.error(`Failed processing import task: ${error.message}`, error.stack);
            } else {
                this.logger.error(`Failed processing import task: ${error.message}`, error.stack);
            }
        });
    }

    public enqueueTask(task: ImportTask) {
        this.queue.enqueue(task);
    }

    private async updateImportTask(task: ImportTask, status: ImportTaskStatus) {
        const taskCopy = {...task};
        const user = task.user;

        taskCopy.user = undefined;
        taskCopy.status = status;

        this.gateway.sendEventToUser(user.id, new ImportTaskUpdateEvent(taskCopy));
        await this.service.setImportStatus([task], status);
    }

}