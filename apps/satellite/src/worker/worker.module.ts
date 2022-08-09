import { Module } from "@nestjs/common";
import { WorkerService } from "./services/worker.service";

@Module({
    providers: [
        WorkerService
    ]
})
export class WorkerModule {}