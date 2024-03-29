import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Page, Pageable } from "@soundcore/common";
import { PipelineRegistry, PipelineRun, RunStatus, IPipeline } from "@soundcore/pipelines";
import { Repository } from "typeorm";
import { Task } from "../entities/task.entity";
import { TasksGateway } from "../gateway/tasks.gateway";

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        private readonly gateway: TasksGateway,
        private readonly registry: PipelineRegistry,
        @InjectRepository(Task) private readonly repository: Repository<Task>
    ) {}

    /**
     * Find a page of tasks. The result is ordered by the updated date, so that
     * the currently running tasks are at the top.
     * @param pageable Page settings
     * @returns Page<Task>
     */
    public async findAll(pageable: Pageable): Promise<Page<Task>> {
        return this.repository.createQueryBuilder("task")
            .select(["task.id", "task.runId", "task.name", "task.description", "task.status", "task.createdAt", "task.updatedAt"])
            .offset(pageable.offset)
            .limit(pageable.limit)
            .orderBy("task.updatedAt", "DESC")
            .getManyAndCount().then(([tasks, total]) => {
                return Page.of(tasks, total, pageable);
            })
    }

    /**
     * Find a page with task definitions that are currently registered
     * @param pageable Page settings
     * @returns Page<IPipeline>
     */
    public async findDefinitions(pageable: Pageable): Promise<Page<IPipeline>> {
        return this.registry.listAll().then((definitions) => {
            return Page.of( definitions.splice(pageable.offset, pageable.limit), definitions.length, pageable);
        });
    }

    /**
     * Find a task by its run Id
     * @param runId Run-Id of the task
     * @returns 
     */
    public async findTaskByRunId(runId: string): Promise<Task> {
        return this.repository.findOne({
            where: {
                runId: runId
            }
        });
    }

    public async emitTasks(tasks: Task[]) {
        return this.gateway.emitTasks(tasks);
    }

    public async createTaskFromPipelineRun(run: PipelineRun): Promise<Task> {
        return this.repository.createQueryBuilder()
            .insert()
            .values(run)
            .orIgnore()
            .returning(["runId"])
            .execute().then((insertResult) => {
                if(insertResult.identifiers.length <= 0) return null;
                return this.repository.createQueryBuilder("task")
                    .whereInIds(insertResult.raw)
                    .getOne();
            })
    }

    public async updateTask(task: Task, emit: boolean = false): Promise<Task> {
        const updatedTask = new Task();
        updatedTask.currentStageId = task.currentStageId;
        updatedTask.stages = task.stages;
        updatedTask.status = task.status;

        return this.repository.createQueryBuilder()
            .update()
            .set(updatedTask)
            .where("runId = :runId", { runId: task.runId })
            .execute().then((updateResult) => {
                if(updateResult.affected <= 0) return null;
                if(emit) return this.emitTasks([task]).then(() => task);
                return task;
            });
    }

    public async clearEnqueuedTasks(): Promise<void> {
        await this.repository.createQueryBuilder()
            .update()
            .set({
                status: RunStatus.ABORTED
            })
            .where("status = :status", { status: RunStatus.ENQUEUED })
            .execute().then((updateResult) => {
                if(updateResult.affected <= 0) return;
                this.logger.log(`Marked ${updateResult.affected} enqueued tasks as 'ABORTED'`);
            })
    }

    public async clearOldTasks(): Promise<void> {
        await this.repository.createQueryBuilder()
            .delete()
            .where("createdAt <= :pivotDate", { pivotDate: new Date(Date.now() - 1000*60*60*24*7) })
            .execute().then((updateResult) => {
                if(updateResult.affected <= 0) return;
                this.logger.log(`Cleared ${updateResult.affected} tasks older than 7 days`);
            })
    }

}