import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Page, Pageable } from "../../pagination";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { Future, toFuture } from "../../utils/future";
import { Task } from "../entities/task.entity";

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
        return this.httpClient.get<Page<Task>>(`${this.options.api_base_uri}/v1/tasks${pageable.toQuery()}`).pipe(toFuture());
    }

}