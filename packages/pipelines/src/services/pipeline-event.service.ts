import { Injectable } from "@nestjs/common";
import { EventHandler, EventHandlerParams, EventName } from "../event/event";

@Injectable()
export class PipelineEventService {

    private readonly eventHandlers: Map<EventName, EventHandler<EventName>[]> = new Map();

    /**
     * Register an event handler.
     * @param eventName Name of the event
     * @param handler Handler for the event
     */
    public on<T extends EventName>(eventName: T, handler: EventHandler<T>) {
        const handlers = this.eventHandlers.get(eventName) ?? [];
        handlers.push(handler);
        this.eventHandlers.set(eventName, handlers);
    }

    /**
     * Unregister an event handler
     * @param eventName Name of the event to unregister
     * @param handler Handler to remove
     */
    public off<T extends EventName>(eventName: T, handler: EventHandler<T>) {
        const handlers = this.eventHandlers.get(eventName) ?? [];
        const index = handlers.findIndex((h) => h == handler);
        if(index == -1) return;

        handlers.splice(index, 1);
        this.eventHandlers.set(eventName, handlers);
    }

    /**
     * Fire a registered event handler
     * @param eventName Name of the event to fire
     * @param args Additional args that should be passed to the handler
     */
    public fireEvent<T extends EventName>(eventName: T, ...params: EventHandlerParams<T>) {
        return this.firePureEvent(eventName, ...params);
    }

    public firePureEvent<T extends EventName>(eventName: T, ...args: any[]) {
        const handlers = this.eventHandlers.get(eventName) as ((...args: any[]) => void)[] ?? [];
        for(const handler of handlers) {
            handler(...Object.values(args));
        }
    }

}