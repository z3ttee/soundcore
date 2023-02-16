import { Outputs, PipelineBuilder, PipelineStatus } from "./pipeline.entity";
import { Step, StepBuilder } from "./step.entity";

export type StageResources = { [key: string]: any }

export class Stage {
    public currentStep: Step = null;
    public status: PipelineStatus = PipelineStatus.WAITING;
    public skipReason?: string;
    public readonly outputs: Outputs = {};

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly steps: Step[],
    ) {}
}


/**
 * Reference object that contains information about a stage.
 * It also includes helper functions to write to outputs or emit messages
 * as well as posting progress updates.
 */
export class StageRef implements Pick<Stage, "id" | "name"> {

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly resources: StageResources,
        message: (...args: any[]) => void,
        read: (key: string) => void,
        skip: (reason: string) => void,
    ) {
        this.message = message;
        this.read = read;
        this.skip = skip;
    }

    public message(...args: any[]): void {};
    public read(key: string): any {};
    public skip(reason: string): void {};
}

/**
 * Function that emits an event of the stage
 */
export type StageEmitter = (event: string, ...args: any[]) => void;

export type StageInitializer = () => Promise<StageResources>;
export class StageBuilder {
    private readonly _steps: StepBuilder[] = [];
    private _initializer: StageInitializer;

    constructor(
        private readonly pipelineBuilder: PipelineBuilder,
        private readonly id: string,
        private readonly name: string,
        private readonly description?: string
    ) {}

    public step(stepId: string, name: string, description?: string): StepBuilder {
        const builder = new StepBuilder(this, stepId, name, description);
        this._steps.push(builder);
        return builder;
    }

    public useResources(initializer: StageInitializer): StageBuilder {
        this._initializer = initializer;
        return this;
    }

    public done(): PipelineBuilder {
        return this.pipelineBuilder;
    }
}