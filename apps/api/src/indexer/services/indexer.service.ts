import { Injectable, Logger } from "@nestjs/common";
import { PipelineService } from "@soundcore/pipelines";
import { Task } from "../../tasks/entities/task.entity";
import { TasksService } from "../../tasks/services/tasks.service";
import { PIPELINE_INDEX_ID } from "../pipelines";

@Injectable()
export class IndexerService {
    private logger: Logger = new Logger(IndexerService.name);

    constructor(
        private readonly pipelines: PipelineService,
        private readonly taskService: TasksService
    ) {
        this.pipelines.on("failed", (error, { pipeline }) => {
            console.error(error);
            console.log("Pipeline " + pipeline.id + " failed");
        })
        this.pipelines.on("completed", ({ pipeline }) => {
            console.log("Pipeline " + pipeline.id + " completed");
        })
        this.pipelines.on("status", (params) => {
            const task: Task = params.pipeline as Task;
            this.taskService.updateTask(task, true);
            console.log("Pipeline status: ", task.status);
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