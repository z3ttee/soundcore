import { Outputs, RunStatus } from "./common.entity";
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
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly description: string,
        public readonly dependsOn: string[],
        public readonly steps: Step[],
        public status: RunStatus,
        public currentStepId: string
    ) {}
}

export class StageRef implements Omit<IStage, "dependsOn" | "steps"> {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly description: string
    ) {}
}

export type StageConditionEvaluator = (prevOutput: Outputs, shared: Outputs) => boolean | Promise<boolean>;