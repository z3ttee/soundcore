import { Injectable, Logger } from "@nestjs/common";
import { PipelineService } from "@soundcore/pipelines";
import { Task } from "../../tasks/entities/task.entity";
import { TasksService } from "../../tasks/services/tasks.service";
import { ArtworkFlag } from "../entities/artwork.entity";
import { ArtworkPipelineEnv } from "../pipelines/artwork.pipeline";
import { ARTWORK_PIPELINE_ID } from "../pipelines/constants";
import { ArtworkService } from "./artwork.service";

@Injectable()
export class ArtworkBackgroundService {
    private readonly logger = new Logger(ArtworkBackgroundService.name);

    constructor(
        private readonly service: ArtworkService,
        private readonly taskService: TasksService,
        private readonly pipelines: PipelineService
    ) {
        // Listen for status events
        this.pipelines.on("status", (params) => {
            const task: Task = params.pipeline as Task;
            this.taskService.updateTask(task, true);
        });
        
        // Listen for failed events
        this.pipelines.on("failed", (error, params) => {
            this.logger.error(`Pipeline '${params.pipeline.id}' failed: ${error.message}`, error.stack);
        });
    }

    /**
     * Checks if there are artworks which pipeline run 
     * were aborted by the system.
     * Such abortions usually occur when the application crashes
     * or restarts
     */
    // @Interval(30000)
    public async checkAbortedArtworks() {
        return this.service.hasAbortedArtworks().then((hasAborted) => {
            if(!hasAborted) return;

            this.logger.warn(`Found artworks where processing was aborted by system. Enqueueing task...`);
            
            return this.createPipelineRun({
                withFlagsOnly: [ ArtworkFlag.ABORTED ]
            });
        }).catch((error: Error) => {
            this.logger.error(`Failed checking for aborted artworks: ${error.message}`, error.stack);
            return null;
        });
    }

    /**
     * Mark artworks, that are marked as AWAITING, as ABORTED.
     * This is done to be able to re-enqueue artwork processes on
     * application restart
     * @returns True, if artworks were marked successfully. Otherwise false
     */
    public async markAwaitingAsAborted() {
        return this.service.getRepository().createQueryBuilder()
            .update()
            .set({ flag: ArtworkFlag.ABORTED })
            .where("flag = :flag", { flag: ArtworkFlag.AWAITING })
            .execute().then(() => {
                return true;
            }).catch((error: Error) => {
                this.logger.error(`Failed marking artworks affected by application restart as ABORTED: ${error.message}`, error.stack);
                return false;
            })
    }

    public async createPipelineRun(env?: ArtworkPipelineEnv) {
        return this.pipelines.createRun(ARTWORK_PIPELINE_ID, env).then((run) => {
            return this.taskService.createTaskFromPipelineRun(run).then((task) => {
                return this.pipelines.enqueueRun(task).then(() => task);
            });
        });
    }
}