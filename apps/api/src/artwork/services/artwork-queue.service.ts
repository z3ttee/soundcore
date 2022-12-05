import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Environment } from "@soundcore/common";
import { WorkerJob, WorkerJobRef, WorkerQueue } from "@soundcore/nest-queue";
import { EVENT_SONG_CREATE_ARTWORK } from "../../constants";
import { ArtworkProcessResultDTO } from "../dtos/artwork-process-result.dto";
import { ArtworkProcessDTO, ArtworkSourceType } from "../dtos/artwork-process.dto";
import { ArtworkID } from "../entities/artwork.entity";
import { ArtworkService } from "./artwork.service";

@Injectable()
export class ArtworkQueueService {
    private readonly logger = new Logger(ArtworkQueueService.name);

    constructor(
        private readonly service: ArtworkService,
        private readonly queue: WorkerQueue<ArtworkProcessDTO>
    ) {
        this.queue.on("started", (job: WorkerJob<ArtworkProcessDTO>) => this.handleOnWorkerStarted(job));
        this.queue.on("failed", (jobRef: WorkerJobRef<ArtworkProcessDTO>, error: Error) => this.handleOnWorkerFailed(jobRef, error));
        this.queue.on("completed", (job: WorkerJob<ArtworkProcessDTO, ArtworkProcessResultDTO>) => this.handleOnWorkerCompleted(job))
    }

    @OnEvent(EVENT_SONG_CREATE_ARTWORK)
    public async onSongCreateArtworkEvent(artworks: string[]) {
        this.queue.enqueue(<ArtworkProcessDTO<string>>{
            sourceType: ArtworkSourceType.SONG,
            entities: artworks
        });
    }

    private async handleOnWorkerStarted(job: WorkerJob<ArtworkProcessDTO>) {
        this.logger.verbose(`Started processing ${job.payload.entities.length} artworks`);
    }

    private async handleOnWorkerFailed(jobRef: WorkerJobRef<ArtworkProcessDTO>, error: Error) {
        if(Environment.isDebug) {
            this.logger.error(`Failed processing artwork: ${error.message}`, error.stack);
        } else {
            this.logger.error(`Failed processing artwork: ${error.message}`);
        }
    }

    private async handleOnWorkerCompleted(job: WorkerJob<ArtworkProcessDTO, ArtworkProcessResultDTO>) {
        const { result } = job;

        this.logger.verbose(`Processed ${result.artworks.length} artworks. Took ${(result.timeTookMs/1000).toFixed(2)}s.`);
    }
}