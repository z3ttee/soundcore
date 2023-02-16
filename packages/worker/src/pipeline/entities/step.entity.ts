import { PipelineLogger } from "../logging/logger";
import { Environment, Outputs, PipelineRef, PipelineStatus } from "./pipeline.entity";
import { StageBuilder, StageRef } from "./stage.entity";

export class Step {    
    public progress: number = 0;
    public status: PipelineStatus = PipelineStatus.WAITING;
    public skipReason?: string;
    public readonly outputs: Outputs = {};

    constructor(
        public readonly id: string,
        public readonly name: string,
    ) {}
}

/**
 * Reference object that contains information about a step.
 * It also includes helper functions to write to outputs or emit messages
 * as well as posting progress updates.
 */
export class StepRef implements Pick<Step, "id" | "name"> {
    constructor(
        public readonly id: string,
        public readonly name: string,
        progress: (progress: number) => void,
        message: (...args: any[]) => void,
        write: (key: string, value: any) => void,
        read: (key: string) => void,
        skip: (reason: string) => void,
        abortFatal: (reason: string) => void
    ) {
        this.progress = progress;
        this.message = message;
        this.write = write;
        this.read = read;
        this.skip = skip;
        this.abortFatal = abortFatal;
    }

    public write(key: string, value: any): void {};
    public progress(progress: number): void {};
    public message(...args: any[]): void {};
    public read(key: string): any {};
    public skip(reason: string): void {};
    public abortFatal(reason: string): void {};

}

export class StepBuilder {
    private _runner: StepRunner;

    constructor(
        private readonly stageBuilder: StageBuilder,
        private readonly id: string,
        private readonly name: string,
        private readonly description?: string
    ) {}

    public run(runner: StepRunner): StageBuilder {
        this._runner = runner;
        return this.stageBuilder;
    }
}

/**
 * Function that emits an event of the steü
 */
export type StepEmitter = (event: string, ...args: any[]) => void;
/**
 * Logger is only available, if logging is not disabled in module options
 */
export type StepRunner = (params: { step: StepRef, stage: StageRef, pipeline: PipelineRef, environment: Environment, logger: PipelineLogger }) => Promise<void> | void;