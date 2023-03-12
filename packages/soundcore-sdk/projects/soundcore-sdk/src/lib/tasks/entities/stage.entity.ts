import { RunStatus } from "./common.entity";
import { IStep, Step } from "./step.entity";

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