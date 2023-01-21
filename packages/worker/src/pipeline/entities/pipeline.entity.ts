
export interface Environment {
    [key: string]: any;
}

export interface Outputs {
    [key: string]: any;
}

export class Stage {
    public readonly id: string;
    public readonly name: string;
    public readonly scriptPath: string;
    public readonly steps: Step[];
    public outputs?: Outputs;
}

export class Step {
    public readonly id: string;
    public readonly name: string;
    public outputs?: Outputs;
}

export class Pipeline {
    public readonly id: string;
    public readonly name: string;
    public readonly stages: Stage[];
    public environment?: Environment;
    public outputs?: Outputs;
}

export type StepRunner = (step: Step, environment: Readonly<Environment>, outputs: Readonly<Outputs>) => Promise<void> | void;
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

export class StageOptions implements Omit<Stage, "outputs"> {
    public name: string;
    public id: string;
    public scriptPath: string;
    public steps: StepOptions[];
}

export class StepOptions implements Omit<Step, "outputs"> {
    public id: string;
    public name: string;
}

export type StageEmitter = (event: string, data: any) => void;
export type StageExecutor = (environment: Readonly<Environment>, emit: StageEmitter) => Promise<StageRunner>
