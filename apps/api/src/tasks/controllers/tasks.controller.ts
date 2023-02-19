import { Controller, Get } from "@nestjs/common";
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

}