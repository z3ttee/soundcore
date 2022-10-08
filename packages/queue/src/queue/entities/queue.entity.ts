import { QueueEvent, QueueEventName } from "../events/events";
import { BaseQueue } from "../../shared/queue-interface";

export class Queue<T = any> extends BaseQueue<T, QueueEventName, QueueEvent<QueueEventName>> {

    constructor(debounceMs: number = 0) {
        super(debounceMs);

        this.$queue.subscribe((queue) => {
            if(queue.length > 0) {
                const handler: QueueEvent<"waiting"> = this.eventRegistry.get("waiting") as QueueEvent<"waiting">;
                if(typeof handler !== "undefined" && handler != null) handler(queue.length);
            } else {
                const handler: QueueEvent<"drained"> = this.eventRegistry.get("drained") as QueueEvent<"drained">;
                if(typeof handler !== "undefined" && handler != null) handler();
            }  
        })
    }

}