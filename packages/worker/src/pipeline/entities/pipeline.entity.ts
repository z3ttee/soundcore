import crypto from "node:crypto";
import { Stage, StageOptions } from "./stage.entity";

export type Environment = any;
export type Outputs = any;

export enum PipelineStatus {
    ENQUEUED = "enqueued",
    WAITING = "waiting",
    WORKING = "working",
    FAILED = "failed",
    WARNING = "warning",
    COMPLETED = "completed",
    SKIPPED = "skipped"
}

export class Pipeline {
    public readonly runId: string = crypto.randomUUID();
    public currentStage: Stage = null;
    public status: PipelineStatus = PipelineStatus.ENQUEUED;

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly stages: Stage[],
        public readonly outputs: Outputs = {},
        public readonly environment: Environment = {}
    ) {}
}

/**
 * Reference object that contains information about a pipeline.
 * It also includes helper functions to write to outputs or emit messages
 * as well as posting progress updates.
 */
export class PipelineRef implements Pick<Pipeline, "id" | "runId" | "name">, Partial<Pick<Pipeline, "environment">> {
    constructor(
        public readonly id: string,
        public readonly runId: string,
        public readonly name: string,
        public readonly environment?: Environment,
    ) {}
}

export class PipelineOptions implements Pick<Pipeline, "id" | "name"> {
    public id: string;
    public name: string;
    public stages: StageOptions[];
}

export abstract class PipelineInteractable {
    public progress(progress: number): void {};
    public message(...args: any[]): void {};
    public write(key: string, value: any): void {};
    public read(key: string): any {};
    public skip(reason: string): void {};
}
