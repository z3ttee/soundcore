import crypto from "node:crypto";
import { Stage, StageBuilder } from "./stage.entity";
import { StepRunner } from "./step.entity";

export type Environment = any;
export type Outputs = any;

export enum PipelineStatus {
    ENQUEUED = "enqueued",
    WAITING = "waiting",
    WORKING = "working",
    FAILED = "failed",
    WARNING = "warning",
    COMPLETED = "completed",
    SKIPPED = "skipped"
}

export class Pipeline {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly stages: Stage[],
        public readonly environment: Environment = {},
    ) {}
}

/**
 * Reference object that contains information about a pipeline.
 * It also includes helper functions to write to outputs or emit messages
 * as well as posting progress updates.
 */
export class PipelineRef implements Pick<PipelineRun, "id" | "runId" | "name">, Partial<Pick<Pipeline, "environment">> {
    constructor(
        public readonly id: string,
        public readonly runId: string,
        public readonly name: string,
        read: (key: string) => any,
        skip: (reason: string) => void,
        message: (...args: any[]) => void,
        public readonly environment?: Environment,
    ) {        
        this.read = read;
        this.skip = skip;
        this.message = message;
    }

    public message(...args: any[]): void {};
    public skip(reason: string): void {};
    public read(key: string): any {};
}

export class PipelineBuilder {
    private _concurrent: number = 1;
    private _environment: Environment = {};

    private readonly _stages: StageBuilder[] = [];

    constructor(
        private readonly id: string,
        private readonly name: string
    ) {}

    /**
     * Register a new pipeline builder. This is used
     * to define a new pipeline.
     * @param pipelineId The id of the new pipeline
     * @param name Name of the pipeline
     * @param description Optional description to convey the purpose of the pipeline
     * @returns PipelineBuilder
     */
    public static createPipeline(pipelineId: string, name: string): PipelineBuilder {
        return new PipelineBuilder(pipelineId, name);
    }

    /**
     * Set the maximum amount for concurrently running pipelines.
     * @default 1
     * @param maxConcurrentRuns Define how many runs of the same pipeline are allowed simultaneously
     * @returns PipelineBuilder
     */
    public concurrent(maxConcurrentRuns: number): PipelineBuilder {
        this._concurrent = maxConcurrentRuns;
        return this;
    }

    /**
     * Define environmental data to be used in all pipelines
     * of this type.
     * @param environment Data object
     * @returns PipelineBuilder
     */
    public useEnv(environment: Environment): PipelineBuilder {
        this._environment = environment;
        return this;
    }

    /**
     * Initialize a new stage in the pipeline.
     * @param stageId Id of the stage
     * @param name Name of the stage
     * @param description Optional description to convey the purpose of the stage
     */
    public stage(stageId: string, name: string, description?: string): StageBuilder {
        const builder = new StageBuilder(this, stageId, name, description);
        this._stages.push(builder);
        return builder;
    }
}

export interface PipelineOptions {
    concurrent?: number;
}

export class PipelineWithOptions extends Pipeline {
    constructor(
        public readonly options: PipelineOptions,
        id: string,
        name: string,
        stages: Stage[],
        environment?: Environment
    ) {
        super(id, name, stages, environment);
    }
}

export class PipelineWithScript extends PipelineWithOptions {
    constructor(
        public readonly script: string,
        options: PipelineOptions,
        id: string,
        name: string,
        stages: Stage[],
        environment?: Environment
    ) {
        super(options, id, name, stages, environment);
    }
}

export class PipelineRun extends PipelineWithScript {
    public readonly runId: string = crypto.randomUUID();
    public currentStage: Stage = null;
    public status: PipelineStatus = PipelineStatus.ENQUEUED;
    public readonly outputs: Outputs = {};
}

export class PipelineRunner {

}

export function runner() {
    return
}

export interface PipelineExecutor {

}