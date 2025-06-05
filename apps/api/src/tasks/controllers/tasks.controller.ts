import { Controller, Get, Param } from "@nestjs/common";
import { Pagination } from "@repo/nestjs";
import { Pageable } from "@repo/utilities";
import { TasksService } from "../services/tasks.service";

@Controller("tasks")
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Get()
  public async findAll(@Pagination() pageable: Pageable) {
    return this.service.findAll(pageable);
  }

  @Get("definitions")
  public async findDefinitions(@Pagination() pageable: Pageable) {
    return this.service.findDefinitions(pageable);
  }

  @Get("run/:runId")
  public async findByRunId(@Param("runId") runId: string) {
    return this.service.findTaskByRunId(runId);
  }
}
