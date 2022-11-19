import path from "node:path";

import { Module } from "@nestjs/common";
import { WorkerQueueModule } from "@soundcore/nest-queue";
import { JanitorService } from "./services/janitor.service";

// TODO: Implement janitor for indexing process

@Module({
    providers: [
        JanitorService
    ],
    imports: [
        WorkerQueueModule.forFeature({
            script: path.join(__dirname, "worker", "janitor-base.worker.js"),
            concurrent: 10,
            workerType: "thread"
        })
    ],
    exports: [
        JanitorService
    ]
})
export class JanitorModule {}