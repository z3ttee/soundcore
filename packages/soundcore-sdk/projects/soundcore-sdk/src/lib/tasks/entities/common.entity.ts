export type Environment<T = { [key: string]: any }> = T;
export type Outputs<T = { [key: string]: any }> = T;

export enum RunStatus {
    ENQUEUED = "enqueued",
    WORKING = "working",
    FAILED = "failed",
    ABORTED = "aborted",
    SKIPPED = "skipped",
    COMPLETED = "completed"
}