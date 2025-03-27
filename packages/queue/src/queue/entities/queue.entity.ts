import { QueueEventName } from "../events/events";
import { BaseQueue } from "../../queue";

export class Queue<T = any> extends BaseQueue<T, QueueEventName> {

    constructor(debounceMs: number = 0) {
        super(debounceMs);

        this.$queue.subscribe((queue) => {
            if (queue.length > 0) {
                const handlers = this._getHandlersForEvent("waiting");
                if (typeof handlers !== "undefined" && handlers != null) handlers.forEach((handler) => handler(queue.length));
            } else {
                const handlers = this._getHandlersForEvent("drained");
                if (typeof handlers !== "undefined" && handlers != null) handlers.forEach((handler) => handler(queue.length));
            }
        });
    }

}