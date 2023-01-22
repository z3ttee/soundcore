
export interface Environment {
    [key: string]: any;
}

export interface Outputs {
    [key: string]: any;
}

export class Stage {
    public progress: (progress: number) => void;
    public message: (...args: any[]) => void;
    public write: (key: string, value: any) => void;

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly scriptPath: string,
        public readonly steps: Step[],
        public readonly outputs: Outputs
    ) {}
}

export class Step {    
    public progress: (progress: number) => void;
    public message: (...args: any[]) => void;
    public write: (key: string, value: any) => void;

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly outputs: Outputs
    ) {}
}

export class Pipeline {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly stages: Stage[],
        public readonly outputs: Outputs,
        public environment?: Environment
    ) {}
}

export type StepRunner = (step: Step) => Promise<void> | void;
export interface StageRunnerSteps {
    [key: string]: StepRunner
}

export interface StageRunner {
    steps: StageRunnerSteps;
}

export class PipelineOptions implements Omit<Pipeline, "outputs" | "stages" | "environment"> {
    public id: string;
    public name: string;
    public stages: StageOptions[];
}

export class StageOptions implements Omit<Stage, "outputs" | "progress" | "message" | "steps" | "write"> {
    public name: string;
    public id: string;
    public scriptPath: string;
    public steps: StepOptions[];
}

export class StepOptions implements Omit<Step, "outputs" | "progress" | "message" | "write"> {
    public id: string;
    public name: string;
}

export type StageEmitter = (event: string, ...args: any[]) => void;
export type StepEmitter = (event: string, ...args: any[]) => void;

export type StageExecutor = (stage: Stage, environment: Readonly<Environment>) => Promise<StageRunner>

