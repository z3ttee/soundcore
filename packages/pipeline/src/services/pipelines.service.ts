import path from "node:path";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Page, Pageable } from "nestjs-pager";
import { Repository } from "typeorm";
import { WorkerPool, pool } from "workerpool";
import { DEFAULT_CONCURRENT_PIPELINES, GLOBAL_OPTIONS_TOKEN, LOCAL_OPTIONS_TOKEN, MODULE_POLLING_INTERVAL_NAME } from "../constants";
import { CreatePipelineRunDTO } from "../dtos/create-run.dto";
import { IPipeline, PipelineRun } from "../entities/pipeline.entity";
import { PipelineQueue } from "./pipeline-queue.service";
import { PipelineRegistry } from "./pipeline-registry.service";
import { SchedulerRegistry } from "@nestjs/schedule";
import { RunStatus } from "../entities/common.entity";
import { EventHandler, EventName, WorkerEmitEvent } from "../event/event";
import { PipelineEventService } from "./pipeline-event.service";
import { PipelineGlobalOptions, PipelineLocalOptions } from "../pipelines.module";
import { Stage } from "../entities/stage.entity";
import { Step } from "../entities/step.entity";
import { inspect } from "node:util";

@Injectable()
export class PipelineService {
    private readonly logger = new Logger(PipelineService.name);

    private readonly pool: WorkerPool;
    private readonly running: Map<string, PipelineRun> = new Map();

    private isDispatching: boolean = false;

    constructor(
        private readonly queue: PipelineQueue,
        private readonly registry: PipelineRegistry,
        private readonly scheduler: SchedulerRegistry,
        private readonly events: PipelineEventService,
        @Inject(GLOBAL_OPTIONS_TOKEN) private readonly globalOptions: PipelineGlobalOptions,
        @Inject(LOCAL_OPTIONS_TOKEN) private readonly localOptions: PipelineLocalOptions,
        @InjectRepository(PipelineRun) private readonly repository: Repository<PipelineRun>,
    ) {
        // Create worker pool
        this.pool = pool(path.resolve(__dirname, "..", "worker", "pipeline.worker.js"), {
            workerType: "process",
            minWorkers: 1,
            maxWorkers: Math.max(1, Math.min(0, this.localOptions.concurrent ?? DEFAULT_CONCURRENT_PIPELINES)),
            forkOpts: {
                env: {
                    ...process.env
                }
            }
        });

        // Register polling interval
        if(!this.scheduler.doesExist("interval", MODULE_POLLING_INTERVAL_NAME)) {
            this.scheduler.addInterval(MODULE_POLLING_INTERVAL_NAME, setInterval(() => {
                // Check if previous polling interval is still busy dispatching worker
                if(!this.isDispatching) {
                    // If not, dispatch next run and
                    // update status accordingly
                    this.isDispatching = true;
                    this.dispatchNextRun().finally(() => this.isDispatching = false);
                }
            }, Math.max(1000, Math.min(60000, this.localOptions.pollingRateMs ?? 10000))));
        }

        // Listen on enqueued event
        this.on("enqueued", (position, { pipeline }) => {
            this.logger.log(`Enqueued pipeline '${pipeline.id}' with run id '${pipeline.runId}' (${position})`);
        })
    }

    /**
     * Find a full list of registered pipeline definitions
     * @returns IPipeline[]
     */
    public async findPipelineDefinitions(): Promise<IPipeline[]> {
        return this.registry.listAll();
    }

    public async findRunningPipelines(pageable: Pageable): Promise<Page<PipelineRun>> {
        return this.repository.createQueryBuilder("pipeline")
            .offset(pageable.offset)
            .limit(pageable.limit)
            .getManyAndCount().then(([entities, total]) => {
                return Page.of(entities, total, pageable.offset);
            });
    }

    /**
     * Create a new pipeline run. This will create an entry in the database and
     * enqueue the run.
     * @param createPipelineRunDto Options for creating the pipeline run
     * @returns PipelineRun
     */
    public async createRun(createPipelineRunDto: CreatePipelineRunDTO): Promise<PipelineRun> {
        const definition = this.registry.get(createPipelineRunDto.id);

        const pipeline = new PipelineRun();
        pipeline.environment = createPipelineRunDto.environment ?? undefined;
        pipeline.id = definition.id;
        pipeline.name = definition.name;
        pipeline.description = definition.description;
        pipeline.status = RunStatus.ENQUEUED;
        pipeline.stages = definition.stages.map((stage) => new Stage(
            stage.id,
            stage.name,
            stage.description,
            stage.dependsOn,
            stage.steps.map((step) => new Step(step.id, step.name, step.description, RunStatus.ENQUEUED, 0)),
            RunStatus.ENQUEUED,
            stage.steps?.[0]?.id
        ));

        return this.repository.createQueryBuilder()
            .insert()
            .values(pipeline)
            .returning(["id"])
            .execute().then((insertResult) => {
                if(insertResult.identifiers.length <= 0) return null;
                return this.repository.createQueryBuilder("run")
                    .whereInIds(insertResult.identifiers)
                    .getOne().then((result) => {
                        this.queue.enqueue(result);
                        return result;
                    });
            });
    }

    /**
     * Register an event handler.
     * @param eventName Name of the event
     * @param handler Handler for the event
     */
    public on<T extends EventName>(eventName: T, handler: EventHandler<T>) {
        return this.events.on(eventName, handler);
    }

    /**
     * Unregister an event handler
     * @param eventName Name of the event to unregister
     * @param handler Handler to remove
     */
    public off<T extends EventName>(eventName: T, handler: EventHandler<T>) {
        return this.events.off(eventName, handler);
    }

    private async dispatchNextRun(): Promise<PipelineRun> {
        // No runs enqueued
        if(this.queue.isEmpty) return null;

        const currentlyRunning: number = this.pool.stats().busyWorkers;
        const totalCapacity: number = this.localOptions.concurrent ?? DEFAULT_CONCURRENT_PIPELINES;

        // Max concurrently running pipelines reached
        if(currentlyRunning >= totalCapacity) return null;

        // Dequeue next run
        const pipelineRun = this.queue.dequeue();
        const definition = this.registry.get(pipelineRun.id);

        // Execute the pipeline in the worker pool
        this.pool.exec("default", [ pipelineRun, definition, this.globalOptions, this.localOptions ], {
            // Subscribe to any event
            on: (payload: WorkerEmitEvent<any>) => {
                const { name, args } = payload;
                this.events.firePureEvent(name, ...args);
            }
        }).then((pipelineRun: PipelineRun) => {
            // Update pipeline status
            pipelineRun.status = RunStatus.COMPLETED;
            pipelineRun.currentStageId = null;

            this.events.fireEvent("completed", { pipeline: pipelineRun });
        }).catch((error: Error) => {
            // Update pipeline status
            pipelineRun.currentStageId = null;
            pipelineRun.status = RunStatus.FAILED;

            this.events.fireEvent("failed", error, { pipeline: pipelineRun });
            // if(error instanceof SkippedException || error instanceof AbortException) {
            //     pipeline.status = error instanceof AbortException ? RunStatus.WARNING : RunStatus.COMPLETED;

            //     // Handle successful completion
            //     const handlers = this.eventHandlers.get("pipeline:completed") as PipelineCompletedEventHandler[] ?? [];
            //     for(const handler of handlers) {
            //         handler(pipeline);
            //     }
            //     return;
            // }

            // // Handle errored completion
            // const handlers = this.eventHandlers.get("pipeline:failed") as PipelineFailedEventHandler[] ?? [];
            // for(const handler of handlers) {
            //     handler(error, pipeline);
            // }
        });
    }

}