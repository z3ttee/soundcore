import { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { Queue } from "./entities/queue.entity";
import { QueueService } from "./services/queue.service";

interface QueueOptions {
    name: string;
}

@Module({
    providers: [
        QueueService
    ],
    exports: [
        QueueService
    ]
})
export class QueueModule {

    public static registerQueue(options: QueueOptions): DynamicModule {
        const queue = new Queue();

        return {
            module: QueueModule,
            providers: [
                {
                    provide: options.name,
                    useValue: queue
                },
                QueueService
            ],
            exports: [
                QueueService
            ]
        }
    }

}