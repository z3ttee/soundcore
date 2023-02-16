import { PipelineAbortedException } from "../exceptions/abortedException";
import { StepSkippedException } from "../exceptions/skippedException";
import { Environment, Outputs, PipelineLogger, Resources } from "./common.entity";
import { IPipeline } from "./pipeline.entity";
import { IStage } from "./stage.entity";

/**
 * Interface used for 
 * step definitions
 */
export interface IStep {
    readonly id: string;
    readonly name: string;
    readonly description: string;
}

export class Step implements IStep {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly description: string,
    ) {}
}

export class StepRef implements IStep {

    public get id(): string {
        return this.definition.id;
    }

    public get name(): string {
        return this.definition.name;
    }

    public get description(): string {
        return this.definition.description;
    }

    constructor(
        private readonly definition: IStep,
        progress: (progress: number) => void,
        message: (message: string) => void,
        abort: (error: string) => never,
        skip: (reason: string) => never
    ) {
        this.progress = progress;
        this.message = message;
        this.skip = skip;
        this.abort = abort;
    }

    /**
     * Emit progress event
     * @param progress Progress value
     */
    public progress(progress: number): void {}
    /**
     * Abort the pipeline run
     * @param error Error to throw to abort pipeline
     */
    public abort(error: string): never {
        throw new PipelineAbortedException(error, {
            id: this.id,
            name: this.name,
            description: this.description
        });
    }
    /**
     * Skip the current step
     * @param reason Reason why the step is skipped
     */
    public skip(reason: string): never {
        throw new StepSkippedException(reason);
    }
    /**
     * Post a message. Use this to emit custom events
     * @param message Message to post
     */
    public message(message: string): void {}
}

export interface StepParams {
    readonly step: StepRef;
    readonly stage: IStage;
    readonly pipeline: IPipeline;
    readonly resources: Resources;
    readonly environment: Environment;
    readonly logger: PipelineLogger;
}

export type StepExecutor = (params: StepParams) => any | Promise<any>;
export type StepConditionEvaluator = (prevOutput: Outputs) => boolean | Promise<boolean>;