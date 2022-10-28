import { DynamicModule, Module } from "@nestjs/common";
import { Queue } from "./entities/queue.entity";

export interface QueueOptions {
    /**
     * Time in milliseconds used to debounce
     * the queue item add listener.
     * Listeners to the queue events will then be notified
     * after the debounce time to prevent spamming.
     * @default 0
     */
    debounceMs?: number;
}

@Module({})
export class QueueModule {

    public static forFeature(options: QueueOptions): DynamicModule {
        
        return {
            module: QueueModule,
            providers: [
                {
                    provide: "queue-options",
                    useValue: options
                },
                {
                    provide: Queue,
                    useValue: new Queue(options.debounceMs)
                }
            ],
            exports: [
                Queue
            ]
        }
    }

}