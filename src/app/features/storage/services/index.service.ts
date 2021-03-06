import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { Page, Pageable } from "src/app/pagination/pagination";
import { DialogService } from "src/app/services/dialog.service";
import { SnackbarService } from "src/app/services/snackbar.service";
import { environment } from "src/environments/environment";
import { Index } from "../../upload/entities/index.entity";
import { IndexReport } from "../entities/index-report.entity";

@Injectable()
export class IndexService {

    constructor(
        private snackbarService: SnackbarService,
        private dialogService: DialogService,
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

    public async reindex(indexId: string): Promise<void> {
        if(!indexId) return;
        return firstValueFrom(this.httpClient.post<void>(`${environment.api_base_uri}/v1/index/reindex/${indexId}`, {}));
    }

    public async searchIndexInMount(query: string, mountId: string, pageable: Pageable): Promise<Page<Index>> {    
        if(!mountId) return Page.of([]);   
        return firstValueFrom(this.httpClient.get<Page<Index>>(`${environment.api_base_uri}/v1/search/index/byMount/${mountId}?q=${query}`));
    }

    public async deleteById(indexId: string): Promise<boolean> {
        return this.dialogService.confirm({
            message: "Bitte best??tige, dass du diese Datei l??schen m??chtest. BEACHTE: Die Datei wird nicht vom Dateisystem gel??scht, sondern vom System als \"ignoriert\" gekennzeichnet."
        }).then((dialogRef) => {
            return firstValueFrom(dialogRef.afterClosed()).then((confirmed) => {
                if(!confirmed) return false;

                return firstValueFrom(this.httpClient.delete<void>(`${environment.api_base_uri}/v1/index/${indexId}`)).then(() => {
                    this.snackbarService.info("Datei gel??scht.")
                    return true;
                }).catch((error) => {
                    console.error(error);
                    this.snackbarService.error(`Fehler: ${error.message}`)
                    return false;
                })
            })
        })
    }

}