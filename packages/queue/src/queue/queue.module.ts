import { DynamicModule, Module } from "@nestjs/common";
import { Queue } from "./entities/queue.entity";

export interface QueueOptions {
    /**
     * Name of the queue
     */
    name: string;

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
        const queue = new Queue(options);
        
        return {
            module: QueueModule,
            providers: [
                {
                    provide: "queue-options",
                    useValue: options
                },
                {
                    provide: Queue,
                    useValue: queue
                }
            ],
            exports: [
                options.name
            ]
        }
    }

}