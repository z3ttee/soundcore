import { Pipeline } from "./pipeline.entity";
import { IStep, Step } from "./step.entity";

/**
 * Interface used for 
 * stage definitions
 */
export interface IStage {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly steps: IStep[];
    readonly dependsOn: string[];
}

export class Stage implements IStage {
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;
    public readonly steps: Step[];
    public readonly dependsOn: string[];

    public readonly currentStep: Step;
}

export class StageRef implements Omit<IStage, "dependsOn" | "steps"> {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly description: string
    ) {}
}