import { Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TasksController } from "./controllers/tasks.controller";
import { Task } from "./entities/task.entity";
import { TasksGateway } from "./gateway/tasks.gateway";
import { TasksService } from "./services/tasks.service";

@Module({
    controllers: [
        TasksController
    ],
    providers: [
        TasksService,
        TasksGateway
    ],
    imports: [
        TypeOrmModule.forFeature([ Task ])
    ],
    exports: [
        TasksService
    ]
})
export class TasksModule implements OnModuleInit {

    constructor(
        private readonly service: TasksService
    ) {}

    async onModuleInit() {
        return this.service.clearEnqueuedTasks();
    }

}