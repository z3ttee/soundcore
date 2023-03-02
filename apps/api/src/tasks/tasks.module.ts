import { DynamicModule, Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OIDCModule } from "../authentication/oidc.module";
import { UserModule } from "../user/user.module";
import { TasksController } from "./controllers/tasks.controller";
import { Task } from "./entities/task.entity";
import { TasksGateway } from "./gateway/tasks.gateway";
import { TasksService } from "./services/tasks.service";

@Module({})
export class TasksModule implements OnModuleInit {

    constructor(
        private readonly service: TasksService
    ) {}

    async onModuleInit() {
        return this.service.clearOldTasks().then(() => {
            return this.service.clearEnqueuedTasks();
        });
    }

    public static forRoot(): DynamicModule {
        return {
            module: TasksModule,
            global: true,
            controllers: [
                TasksController
            ],
            providers: [
                TasksService,
                TasksGateway
            ],
            imports: [
                UserModule,
                OIDCModule,
                TypeOrmModule.forFeature([ Task ])
            ],
            exports: [
                TasksService
            ]
        }
    }

}