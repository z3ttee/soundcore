import { CreateImportDTO } from '../dtos/create-import.dto';

import { ImportTask } from '../entities/import.entity';
import { ApiResponse } from '../../utils/responses/api-response';
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SCDKOptions, SCDK_OPTIONS } from '../../scdk.module';
import { apiResponse } from '../../utils/rxjs/operators/api-response';
import { BehaviorSubject, Observable, of } from 'rxjs';

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

}
