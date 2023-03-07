import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PipelineEventParams, PipelineService } from "@soundcore/pipelines";
import { EVENT_TRIGGER_MEILISEARCH_PROCESS_SONGS } from "../../constants";
import { TasksService } from "../../tasks/services/tasks.service";
import { PIPELINE_ID } from "../pipeline.constants";
import { MeilisearchPipelineEnv } from "../pipelines/meilisearch.pipeline";

@Injectable()
export class MeilisearchService {
    private readonly 

    constructor(
        private readonly pipelines: PipelineService,
        private readonly tasks: TasksService
    ) {
        // this.pipelines.on("enqueued")
        this.pipelines.on("failed", this.handleOnPipelineFailed);
    }

    /**
     * Create new pipeline run to sync resources with meilisearch
     * @param env Environment used for the pipeline run
     */
    public async newSyncRun(env?: MeilisearchPipelineEnv) {
        return this.pipelines.createRun(PIPELINE_ID, env).then((run) => {
            return this.tasks.createTaskFromPipelineRun(run).then((task) => {
                return this.pipelines.enqueueRun(task).then(() => task);
            });
        });
    }

    @OnEvent(EVENT_TRIGGER_MEILISEARCH_PROCESS_SONGS)
    public triggerMeilisearchSync() {
        this.newSyncRun();
    }

    private handleOnPipelineFailed(error: Error, params: PipelineEventParams) {
        
    }

}