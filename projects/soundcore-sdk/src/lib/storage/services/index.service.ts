import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Page } from "../../pagination/page";
import { Pageable } from "../../pagination/pageable";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { Index } from "../entities/index.entity";

@Injectable()
export class SCDKIndexService {

    constructor(
        // private snackbarService: SnackbarService,
        // private dialogService: DialogService,
        private httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

    /**
     * Find an index by its id.
     * @param indexId Index id
     * @returns Observable<Index>
     */
    public findById(indexId: string): Observable<Index> {
        if(!indexId) return of(null);
        return this.httpClient.get<Index>(`${this.options.api_base_uri}/v1/index/${indexId}`);
    }

    /**
     * Find page of indices by a mount.
     * @param mountId Mount's id
     * @param pageable Page settings
     * @returns Observable<Page<Index>>
     */
    public findByMount(mountId: string, pageable: Pageable): Observable<Page<Index>> {
        if(!mountId) return of(Page.of([]));
        return this.httpClient.get<Page<Index>>(`${this.options.api_base_uri}/v1/index/byMount/${mountId}${Pageable.toQuery(pageable)}`)
    }

    /*public async findReportByIndex(indexId: string): Promise<IndexReport> {
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
            message: "Bitte bestätige, dass du diese Datei löschen möchtest. BEACHTE: Die Datei wird nicht vom Dateisystem gelöscht, sondern vom System als \"ignoriert\" gekennzeichnet."
        }).then((dialogRef) => {
            return firstValueFrom(dialogRef.afterClosed()).then((confirmed) => {
                if(!confirmed) return false;

                return firstValueFrom(this.httpClient.delete<void>(`${environment.api_base_uri}/v1/index/${indexId}`)).then(() => {
                    this.snackbarService.info("Datei gelöscht.")
                    return true;
                }).catch((error) => {
                    console.error(error);
                    this.snackbarService.error(`Fehler: ${error.message}`)
                    return false;
                })
            })
        })
    }*/

}