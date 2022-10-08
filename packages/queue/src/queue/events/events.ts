export type EventCallback<T = any> = (data: T, ...args) => Promise<void> | void;
export type QueueEventName = "waiting" | "drained";