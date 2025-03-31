import { RunStatus } from "./common.entity";

export interface IStep {
    readonly id: string;
    readonly name: string;
    readonly description: string;
}

export class Step implements IStep {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly description: string,
        public status: RunStatus,
        public progress: number
    ) {}
}