import { PipelineEventHandler, PipelineEventNames } from "./pipeline-events";

export type EventName = PipelineEventNames;
export type EventHandler<T extends EventName> = 
    T extends PipelineEventNames ? PipelineEventHandler<T> : never;

export type EventHandlerParams<T extends EventName> = Parameters<EventHandler<T>>

export interface WorkerEmitEvent<T extends EventName> {
    name: T;
    args: EventHandlerParams<T>;
}