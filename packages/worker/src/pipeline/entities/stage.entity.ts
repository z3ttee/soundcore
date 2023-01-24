import { Environment, Outputs, PipelineInteractable, PipelineStatus } from "./pipeline.entity";
import { Step, StepOptions, StepRunner } from "./step.entity";

export class Stage {
    public currentStep: Step = null;
    public status: PipelineStatus = PipelineStatus.WAITING;

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly scriptPath: string,
        public readonly steps: Step[],
        public readonly outputs: Outputs,
    ) {}
}



/**
 * Reference object that contains information about a stage.
 * It also includes helper functions to write to outputs or emit messages
 * as well as posting progress updates.
 */
export class StageRef extends PipelineInteractable implements Pick<Step, "id" | "name"> {

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
 * Function that emits an event of the stage
 */
export type StageEmitter = (event: string, ...args: any[]) => void;
/**
 * Function definition for the stage script files
 */
export type StageExecutor = (stage: StageRef, environment: Readonly<Environment>) => Promise<StageRunner>

/**
 * Object definition of the steps in a stage runner
 */
export interface StageRunnerSteps {
    [key: string]: StepRunner
}
/**
 * Object definition returned by the StageExecutor
 */
export interface StageRunner {
    steps: StageRunnerSteps;
}

/**
 * Configuration object used to define stages in a pipeline.
 */
export class StageOptions implements Pick<Stage, "id" | "name" | "scriptPath"> {
    public name: string;
    public id: string;
    public scriptPath: string;
    public steps: StepOptions[];
}