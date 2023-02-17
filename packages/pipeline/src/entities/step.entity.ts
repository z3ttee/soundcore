import { PipelineAbortedException } from "../exceptions/abortedException";
import { SkippedException } from "../exceptions/skippedException";
import { Environment, Outputs, PipelineLogger, Resources, RunStatus } from "./common.entity";
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
        public status: RunStatus,
        public progress: number
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
        abort: (error: string) => never,
        skip: (reason: string) => never
    ) {
        this.skip = skip;
        this.abort = abort;
    }

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
        throw new SkippedException(reason);
    }
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
export type StepConditionEvaluator = (prevOutput: Outputs, shared: Outputs) => boolean | Promise<boolean>;
