import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { Page, Pageable } from "src/app/pagination/pagination";
import { environment } from "src/environments/environment";
import { Index } from "../../upload/entities/index.entity";
import { IndexReport } from "../entities/index-report.entity";

@Injectable()
export class IndexService {

    constructor(
        private httpClient: HttpClient
    ) {}

    public async findPage(mountId: string, pageable: Pageable): Promise<Page<Index>> {
        if(!mountId) return Page.of([]);
        return firstValueFrom(this.httpClient.get<Page<Index>>(`${environment.api_base_uri}/v1/index/byMount/${mountId}${Pageable.toQuery(pageable)}`))
    }

    public async findById(indexId: string): Promise<Index> {
        if(!indexId) return null;
        return firstValueFrom(this.httpClient.get<Index>(`${environment.api_base_uri}/v1/index/${indexId}`));
    }

    public async findReportByIndex(indexId: string): Promise<IndexReport> {
        if(!indexId) return null;
        return firstValueFrom(this.httpClient.get<IndexReport>(`${environment.api_base_uri}/v1/index/reports/${indexId}`));
    }

}