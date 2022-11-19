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
     * Find a page of tasks started by a user.
     * @param userId User's id
     * @param pageable Page settings
     * @returns Page<ImportTask>
     */
    public findAllByUser(userId: string, pageable: Pageable): Observable<ApiResponse<Page<ImportTask>>> {
        if(!userId) return of(null);
        return this.httpClient.get<Page<ImportTask>>(`${this.options.api_base_uri}/v1/imports${pageable.toQuery()}`).pipe(apiResponse());
    }

}
