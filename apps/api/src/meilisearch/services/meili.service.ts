import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PipelineService } from "@soundcore/pipelines";
import { EVENT_TRIGGER_MEILISEARCH_PROCESS_SONGS } from "../../constants";
import { TasksService } from "../../tasks/services/tasks.service";
import { PIPELINE_ID } from "../pipeline.constants";

export const MEILI_DEFAULT_TIMEOUT_MS = 1000*60*5 // 5 Mins for background tasks
export const MEILI_DEFAULT_INTERVAL_MS = 1000*1 // Check task every second

@Injectable()
export class MeilisearchGeneralService {

    constructor(
        private readonly pipelines: PipelineService,
        private readonly tasks: TasksService
    ) {
        // this.pipelines.on("enqueued")
    }

    @OnEvent(EVENT_TRIGGER_MEILISEARCH_PROCESS_SONGS)
    public triggerMeilisearchSync() {
        this.pipelines.createRun(PIPELINE_ID).then((run) => {
            return this.tasks.createTaskFromPipelineRun(run).then((task) => {
                return this.pipelines.enqueueRun(task);
            });
        });
    }

}