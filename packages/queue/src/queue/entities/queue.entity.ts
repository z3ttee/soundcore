import { QueueEventName } from "../events/events";
import { BaseQueue } from "../../shared/queue-interface";

export class Queue<T = any> extends BaseQueue<T, QueueEventName> {

    constructor(debounceMs: number = 0) {
        super(debounceMs);

        this.$queue.subscribe((queue) => {
            if(queue.length > 0) {
                const handlers = this.eventRegistry.get("waiting");
                if(typeof handlers !== "undefined" && handlers != null) handlers.forEach((handler) => handler(queue.length));
            } else {
                const handlers = this.eventRegistry.get("drained") ;
                if(typeof handlers !== "undefined" && handlers != null) handlers.forEach((handler) => handler(queue.length));
            }  
        });
    }

}