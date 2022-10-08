type QueueWaitingEvent = (size: number) => Promise<void> | void;
type QueueDrainedEvent = () => Promise<void> | void;

export type QueueEventName = "waiting" | "drained";
export type QueueEvent<T = QueueEventName> = 
    T extends "waiting" ? QueueWaitingEvent :
    T extends "drained" ? QueueDrainedEvent : Promise<never> | never;