import winston from "winston";
import { Outputs, PipelineStatus } from "./pipeline.entity";

export class Step {    
    public progress: number = 0;
    public status: PipelineStatus = PipelineStatus.WAITING;
    
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly outputs: Outputs
    ) {}
}

/**
 * Reference object that contains information about a step.
 * It also includes helper functions to write to outputs or emit messages
 * as well as posting progress updates.
 */
export class StepRef {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public progress: (progress: number) => void,
        public message: (...args: any[]) => void,
        public write: (key: string, value: any) => void
    ) {}
}

/**
 * Function that emits an event of the steü
 */
export type StepEmitter = (event: string, ...args: any[]) => void;
/**
 * Logger is only available, if logging is not disabled in module options
 */
export type StepRunner = (step: StepRef, logger?: winston.Logger) => Promise<void> | void;

/**
 * Configuration object used to define steps in a pipeline.
 */
export class StepOptions implements Pick<Step, "id" | "name"> {
    public id: string;
    public name: string;
}