import { Logger } from "winston";
import { Stage } from "./stage.entity";

export type Environment<T = { [key: string]: any }> = T;
export type Outputs<T = { [key: string]: any }> = T;
export type PipelineLogger = Logger;
export type Resources<T = { [key: string]: any }> = T;
export type PipelineFlow = Stage[][];

export enum RunStatus {
    ENQUEUED = "enqueued",
    WORKING = "working",
    FAILED = "failed",
    ABORTED = "aborted",
    SKIPPED = "skipped",
    COMPLETED = "completed"
}
