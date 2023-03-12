import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Page, Pageable } from "../../pagination";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { Future, toFuture } from "../../utils/future";
import { Task, TaskDefinition } from "../entities/task.entity";

@Injectable()
export class SCSDKTasksService {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

    /**
     * Find a list of tasks. The list is ordered by the last update date in the database to
     * show the latest running tasks at the top.
     * @param pageable Page settings
     * @returns Future<Page<Task>>
     */
    public findAll(pageable: Pageable): Observable<Future<Page<Task>>> {
        return this.httpClient.get<Page<Task>>(`${this.findAllUrl()}${pageable.toQuery()}`).pipe(toFuture());
    }

    /**
     * Find a list of task definitions
     * @param pageable Page settings
     * @returns Future<Page<TaskDefinition>>
     */
    public findDefinitions(pageable: Pageable): Observable<Future<Page<TaskDefinition>>> {
        return this.httpClient.get<Page<TaskDefinition>>(`${this.options.api_base_uri}/v1/tasks/definitions${pageable.toQuery()}`).pipe(toFuture());
    }

    /**
     * Find a task by its run Id
     * @param runId Run-Id of the task
     * @returns Future<Task>
     */
    public findTaskByRunId(runId: string): Observable<Future<Task>> {
        return this.httpClient.get<Task>(`${this.options.api_base_uri}/v1/tasks/run/${runId}`).pipe(toFuture());
    }

    /**
     * Get the URL used to contact the endpoint for fetching all tasks
     * @returns string
     */
    public findAllUrl(): string {
        return `${this.options.api_base_uri}/v1/tasks`;
    }

}