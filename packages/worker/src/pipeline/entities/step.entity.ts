import winston from "winston";
import { Outputs, PipelineInteractable, PipelineStatus } from "./pipeline.entity";

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
export class StepRef extends PipelineInteractable implements Pick<Step, "id" | "name"> {
    constructor(
        public readonly id: string,
        public readonly name: string,
        progress: (progress: number) => void,
        message: (...args: any[]) => void,
        write: (key: string, value: any) => void,
        read: (key: string) => void
    ) {
        super();

        this.progress = progress;
        this.message = message;
        this.write = write;
        this.read = read;
    }
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