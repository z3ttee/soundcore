import path from "node:path";
import crypto from "node:crypto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { WorkerPool, pool } from "workerpool";
import { DEFAULT_CONCURRENT_PIPELINES, GLOBAL_OPTIONS_TOKEN, LOCAL_OPTIONS_TOKEN } from "../constants";
import { PipelineRun } from "../entities/pipeline.entity";
import { PipelineQueue } from "./pipeline-queue.service";
import { PipelineRegistry } from "./pipeline-registry.service";
import { Environment, RunStatus } from "../entities/common.entity";
import { EventHandler, EventName, WorkerEmitEvent } from "../event/event";
import { PipelineEventService } from "./pipeline-event.service";
import { PipelineGlobalOptions, PipelineLocalOptions } from "../pipelines.module";
import { Stage } from "../entities/stage.entity";
import { Step } from "../entities/step.entity";

@Injectable()
export class PipelineService {
    private readonly logger = new Logger(PipelineService.name);

    private readonly pool: WorkerPool;
    private readonly running: Map<string, PipelineRun> = new Map();

    private isDispatching: boolean = false;

    constructor(
        private readonly queue: PipelineQueue,
        private readonly registry: PipelineRegistry,
        private readonly events: PipelineEventService,
        @Inject(GLOBAL_OPTIONS_TOKEN) private readonly globalOptions: PipelineGlobalOptions,
        @Inject(LOCAL_OPTIONS_TOKEN) private readonly localOptions: PipelineLocalOptions,
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
        const intervalHandler = () => {
            console.log("is dispatching? ", this.isDispatching);

            // Check if previous polling interval is still busy dispatching worker
            if(!this.isDispatching) {
                // If not, dispatch next run and
                // update status accordingly
                this.isDispatching = true;
                this.dispatchNextRun().then((run) => {
                    console.log("dispatched: ", run?.id);
                }).catch((error) => {
                    console.log("dispatch failed", error);
                }).finally(() => this.isDispatching = false);
            }
        }
        setInterval(intervalHandler, Math.max(1000, Math.min(60000, this.localOptions.pollingRateMs ?? 10000)))

        // Listen on enqueued event
        this.on("enqueued", (position, { pipeline }) => {
            this.logger.log(`Enqueued pipeline '${pipeline.id}' with run id '${pipeline.runId}' (${position})`);
        });
    }

    /**
     * Create a new pipeline run. This will create an entry in the database and
     * enqueue the run.
     * @param createPipelineRunDto Options for creating the pipeline run
     * @returns PipelineRun
     */
    public async createRun(pipelineId: string, environment?: Environment): Promise<PipelineRun> {
        const definition = this.registry.get(pipelineId);
        return {
            id: definition.id,
            runId: crypto.randomUUID(),
            name: definition.name,
            description: definition.description,
            status: RunStatus.ENQUEUED,
            environment: environment ?? {},
            currentStageId: undefined,
            stages: definition.stages.map((stage) => new Stage(
                stage.id,
                stage.name,
                stage.description,
                stage.dependsOn,
                stage.steps.map((step) => new Step(step.id, step.name, step.description, RunStatus.ENQUEUED, 0)),
                RunStatus.ENQUEUED,
                stage.steps?.[0]?.id
            ))
        }
    }

    public async enqueueRun(run: PipelineRun): Promise<number> {
        return this.queue.enqueue(run);
    }

    // private async savePipelineRun(run: PipelineRun): Promise<PipelineRun> {
    //     return this.repository.save(run);
    // }

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
        const peek = this.queue.peek();
        // No runs enqueued
        if(typeof peek === "undefined" || peek == null) {
            console.log("queue is empty");
            return null;
        }

        const currentlyRunning: number = this.pool.stats().busyWorkers;
        const totalCapacity: number = this.localOptions.concurrent ?? DEFAULT_CONCURRENT_PIPELINES;

        console.log(currentlyRunning, totalCapacity);

        // Max concurrently running pipelines reached
        if(currentlyRunning >= totalCapacity) {
            console.log("max concurrent reached");
            return null;
        }

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
            pipelineRun.status = pipelineRun.status != RunStatus.COMPLETED ? pipelineRun.status : RunStatus.COMPLETED;
            pipelineRun.currentStageId = null;

            this.events.fireEvent("status", { pipeline: pipelineRun });
            this.events.fireEvent("completed", { pipeline: pipelineRun });
        }).catch((error: Error) => {
            // Update pipeline status
            pipelineRun.currentStageId = null;
            pipelineRun.status = RunStatus.FAILED;

            this.events.fireEvent("status", { pipeline: pipelineRun });
            this.events.fireEvent("failed", error, { pipeline: pipelineRun });
        });
    }

}