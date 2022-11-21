import { CreateImportDTO } from '../dtos/create-import.dto';

import { ImportTask } from '../entities/import.entity';
import { ApiResponse } from '../../utils/responses/api-response';
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SCDKOptions, SCDK_OPTIONS } from '../../scdk.module';
import { apiResponse } from '../../utils/rxjs/operators/api-response';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Pageable } from '../../pagination/pageable';
import { Page } from '../../pagination/page';
import { ImportReport } from '../entities/import-report.entity';

@Injectable()
export class SCSDKImportService {

    private readonly _ongoingImportsSubj: BehaviorSubject<ImportTask[]> = new BehaviorSubject([]);
    public readonly $ongoingImports: Observable<ImportTask[]> = this._ongoingImportsSubj.asObservable();

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

    /**
     * Create a new import task.
     * @param createImportDto Data to send to backend
     * @returns ImportTask
     */
    public create(createImportDto: CreateImportDTO): Observable<ApiResponse<ImportTask>> {
        if(typeof createImportDto === "undefined" || createImportDto == null) return of(null);
        return this.httpClient.post<ImportTask>(`${this.options.api_base_uri}/v1/imports/spotify/playlist`, createImportDto).pipe(apiResponse());
    }

    /**
     * Find a page of pending tasks started by a user.
     * @param userId User's id
     * @param pageable Page settings
     * @returns Page<ImportTask>
     */
    public findPendingByUser(userId: string, pageable: Pageable): Observable<ApiResponse<Page<ImportTask>>> {
        if(!userId) return of(null);
        return this.httpClient.get<Page<ImportTask>>(`${this.options.api_base_uri}/v1/imports/spotify${pageable.toQuery()}`).pipe(apiResponse());
    }

    /**
     * Find a page of completed tasks started by a user.
     * @param userId User's id
     * @param pageable Page settings
     * @returns Page<ImportTask>
     */
    public findCompletedByUser(userId: string, pageable: Pageable): Observable<ApiResponse<Page<ImportTask>>> {
        if(!userId) return of(null);
        return this.httpClient.get<Page<ImportTask>>(`${this.options.api_base_uri}/v1/imports/spotify/completed${pageable.toQuery()}`).pipe(apiResponse());
    }

    /**
     * Find a page of failed tasks started by a user.
     * @param userId User's id
     * @param pageable Page settings
     * @returns Page<ImportTask>
     */
    public findFailedByUser(userId: string, pageable: Pageable): Observable<ApiResponse<Page<ImportTask>>> {
        if(!userId) return of(null);
        return this.httpClient.get<Page<ImportTask>>(`${this.options.api_base_uri}/v1/imports/spotify/failed${pageable.toQuery()}`).pipe(apiResponse());
    }

    /**
     * Delete an import task by its id.
     * (Only deletes if the user also is the importer)
     * @param taskId Task's id
     * @returns True or False
     */
    public deleteById(taskId: string): Observable<ApiResponse<boolean>> {
        if(!taskId) return of(null);
        return this.httpClient.delete<boolean>(`${this.options.api_base_uri}/v1/imports/${taskId}`).pipe(apiResponse());
    }

    /**
     * Find a report by a task.
     * @param taskId Task's id
     * @returns ImportReport
     */
    public findReportByTaskid(taskId: string): Observable<ApiResponse<ImportReport>> {
        if(!taskId) return of(null);
        return this.httpClient.delete<ImportReport>(`${this.options.api_base_uri}/v1/imports/${taskId}/report`).pipe(apiResponse());
    }

}
