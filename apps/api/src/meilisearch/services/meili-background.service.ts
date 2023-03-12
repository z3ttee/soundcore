import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PipelineEventParams, PipelineService } from "@soundcore/pipelines";
import { EVENT_TRIGGER_MEILISEARCH_PROCESS_SONGS } from "../../constants";
import { Task } from "../../tasks/entities/task.entity";
import { TasksService } from "../../tasks/services/tasks.service";
import { MEILISEARCH_PIPELINE_ID } from "../pipeline.constants";
import { MeilisearchPipelineEnv } from "../pipelines/meilisearch.pipeline";
import { MeilisearchService } from "./meili.service";

@Injectable()
export class MeiliBackgroundService {
    private readonly logger = new Logger(MeilisearchService.name);

    constructor(
        private readonly pipelines: PipelineService,
        private readonly tasks: TasksService
    ) {
        this.pipelines.on("status", (params) => this.handleOnPipelineStatus(params));
        this.pipelines.on("failed", (error, params) => this.handleOnPipelineFailed(error, params));
    }

    @OnEvent(EVENT_TRIGGER_MEILISEARCH_PROCESS_SONGS)
    public triggerMeilisearchSync() {
        this.createNewRun();
    }

    /**
     * Create new pipeline run to sync resources with meilisearch
     * @param env Environment used for the pipeline run
     */
    public async createNewRun(env?: MeilisearchPipelineEnv) {
        return this.pipelines.createRun(MEILISEARCH_PIPELINE_ID, env).then((run) => {
            return this.tasks.createTaskFromPipelineRun(run).then((task) => {
                return this.pipelines.enqueueRun(task).then(() => task);
            });
        });
    }



    private handleOnPipelineFailed(error: Error, params: PipelineEventParams) {
        this.logger.error(`Meilisearch background task failed: ${error.message}`, error.stack);
    }

    private handleOnPipelineStatus(params: PipelineEventParams) {
        this.tasks.updateTask(params.pipeline as Task, true);
    }


}