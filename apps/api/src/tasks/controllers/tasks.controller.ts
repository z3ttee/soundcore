import { Controller, Get, Param } from "@nestjs/common";
import { Pageable, Pagination } from "nestjs-pager";
import { Roles } from "../../authentication/decorators/role.decorator";
import { TasksService } from "../services/tasks.service";

@Controller("tasks")
export class TasksController {

    constructor(
        private readonly service: TasksService
    ) {}

    @Roles("admin")
    @Get()
    public async findAll(@Pagination() pageable: Pageable) {
        return this.service.findAll(pageable);
    }

    @Roles("admin")
    @Get("definitions")
    public async findDefinitions(@Pagination() pageable: Pageable) {
        return this.service.findDefinitions(pageable);
    }

    @Roles("admin")
    @Get("run/:runId")
    public async findByRunId(@Param("runId") runId: string) {
        return this.service.findTaskByRunId(runId);
    }

}