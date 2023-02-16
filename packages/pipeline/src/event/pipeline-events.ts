import { PipelineRun } from "../entities/pipeline.entity"

export interface PipelineEventParams {
    pipeline: PipelineRun
}

export type PipelineEnqueuedEventHandler = (position: number, params: PipelineEventParams) => Promise<void> | void;
export type PipelineStartedEventHandler = (params: PipelineEventParams) => Promise<void> | void;
export type PipelineCompletedEventHandler = (params: PipelineEventParams) => Promise<void> | void;
export type PipelineFailedEventHandler = (error: Error, params: PipelineEventParams) => Promise<void> | void;
export type PipelineStatusEventHandler = (params: PipelineEventParams) => Promise<void> | void;
export type PipelineMessageEventHandler = (message: string, params: PipelineEventParams) => Promise<void> | void;

export type PipelineEventNames = "pipeline:enqueued" | "pipeline:started" | "pipeline:completed" | "pipeline:failed" | "pipeline:status" | "pipeline:message"
export type PipelineEventHandler<T extends PipelineEventNames> = 
    T extends "pipeline:enqueued" ? PipelineEnqueuedEventHandler :
    T extends "pipeline:started" ? PipelineStartedEventHandler :
    T extends "pipeline:completed" ? PipelineCompletedEventHandler :
    T extends "pipeline:failed" ? PipelineFailedEventHandler :
    T extends "pipeline:status" ? PipelineStatusEventHandler :
    T extends "pipeline:message" ? PipelineMessageEventHandler : never;