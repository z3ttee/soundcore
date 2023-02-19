import { PipelineRun, PipelineWorkerResult } from "../entities/pipeline.entity"

export interface PipelineEventParams {
    pipeline: PipelineRun
}


export type PipelineEnqueuedEventHandler = (position: number, params: PipelineEventParams) => Promise<void> | void;
export type PipelineDequeuedEventHandler = (params: PipelineEventParams) => Promise<void> | void;
export type PipelineStartedEventHandler = (params: PipelineEventParams) => Promise<void> | void;
export type PipelineCompletedEventHandler = (params: PipelineWorkerResult) => Promise<void> | void;
export type PipelineFailedEventHandler = (error: Error, params: PipelineEventParams) => Promise<void> | void;
export type PipelineStatusEventHandler = (params: PipelineEventParams) => Promise<void> | void;
export type PipelineMessageEventHandler = (message: string, params: PipelineEventParams) => Promise<void> | void;

export type PipelineEventNames = "enqueued" | "dequeued" | "started" | "completed" | "failed" | "status" | "message"
export type PipelineEventHandler<T extends PipelineEventNames> = 
    T extends "enqueued" ? PipelineEnqueuedEventHandler :
    T extends "dequeued" ? PipelineDequeuedEventHandler :
    T extends "started" ? PipelineStartedEventHandler :
    T extends "completed" ? PipelineCompletedEventHandler :
    T extends "failed" ? PipelineFailedEventHandler :
    T extends "status" ? PipelineStatusEventHandler :
    T extends "message" ? PipelineMessageEventHandler : never;