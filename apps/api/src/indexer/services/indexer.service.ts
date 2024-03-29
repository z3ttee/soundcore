import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PipelineService } from "@soundcore/pipelines";
import { EVENT_TRIGGER_ARTWORK_PROCESS_SONGS, EVENT_TRIGGER_MEILISEARCH_PROCESS_SONGS } from "../../constants";
import { Task } from "../../tasks/entities/task.entity";
import { TasksService } from "../../tasks/services/tasks.service";
import { PIPELINE_INDEX_ID } from "../pipelines";

@Injectable()
export class IndexerService {
    private logger: Logger = new Logger(IndexerService.name);

    constructor(
        private readonly pipelines: PipelineService,
        private readonly taskService: TasksService,
        private readonly emitter: EventEmitter2
    ) {
        this.pipelines.on("failed", (error, { pipeline }) => {
            console.error(error);
        })
        this.pipelines.on("completed", ({ pipeline }) => {            
            this.emitter.emit(EVENT_TRIGGER_ARTWORK_PROCESS_SONGS);
            this.emitter.emit(EVENT_TRIGGER_MEILISEARCH_PROCESS_SONGS);
        })
        this.pipelines.on("status", (params) => {
            const task: Task = params.pipeline as Task;
            this.taskService.updateTask(task, true);
        })
    }

    public async indexMount(mountId: string, force: boolean): Promise<Task> {
        return this.pipelines.createRun(PIPELINE_INDEX_ID, {
            force: force,
            mountId: mountId
        }).then((newRun) => {
            return this.taskService.createTaskFromPipelineRun(newRun).then((task) => {
                this.pipelines.enqueueRun(task);
                return task;
            });
        });
    }

}