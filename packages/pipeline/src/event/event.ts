import { PipelineEventHandler, PipelineEventNames } from "./pipeline-events";
import { StageEventHandler, StageEventNames } from "./stage-events";
import { StepEventHandler, StepEventNames } from "./step-events";

export type EventName = PipelineEventNames | StageEventNames | StepEventNames;
export type EventHandler<T extends EventName> = 
    T extends PipelineEventNames ? PipelineEventHandler<T> : 
    T extends StageEventNames ? StageEventHandler<T> : 
    T extends StepEventNames ? StepEventHandler<T> : never;

export type EventHandlerParams<T extends EventName> = Parameters<EventHandler<T>>

export interface WorkerEmitEvent<T extends EventName> {
    name: T;
    args: EventHandlerParams<T>;
}