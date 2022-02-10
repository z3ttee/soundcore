import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { Page, Pageable } from "src/app/pagination/pagination";
import { environment } from "src/environments/environment";
import { Index } from "../../upload/entities/index.entity";

@Injectable()
export class IndexService {

    constructor(
        private httpClient: HttpClient
    ) {}

    public async findPage(mountId: string, pageable: Pageable): Promise<Page<Index>> {
        if(!mountId) return Page.of([]);
        return firstValueFrom(this.httpClient.get<Page<Index>>(`${environment.api_base_uri}/v1/index/byMount/${mountId}`))
    }

}