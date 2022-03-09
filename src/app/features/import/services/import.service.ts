import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom, Observable } from "rxjs";
import { Page } from "src/app/pagination/pagination";
import { environment } from "src/environments/environment";
import { CreatePlaylistDTO } from "../../playlist/dtos/create-playlist.dto";
import { Song } from "../../song/entities/song.entity";
import { Index } from "../../upload/entities/index.entity";
import { IndexStatusService } from "../../upload/services/index-status.service";
import { CreateImportDTO } from "../dtos/create-import.dto";
import { ImportEntity, ImportProgressUpdate } from "../entities/import.entity";
import { ImportStatusService } from "./import-status.service";

@Injectable()
export class ImportService {

    private _importsSubject: BehaviorSubject<ImportEntity[]> = new BehaviorSubject([])
    public $imports: Observable<ImportEntity[]> = this._importsSubject.asObservable();

    constructor(
        private httpClient: HttpClient,
        private importSocket: ImportStatusService,
        private indexSocket: IndexStatusService
    ){
        // Watch on import updates to update status in components
        this.importSocket.$onImportUpdate.subscribe((entity) => {
            this.updateLocalImports(entity)
        })

        // Watch on import progress updates to update status in components
        this.importSocket.$onProgressUpdate.subscribe((data) => {
            this.updateLocalProgress(data)
        })

        // Watch on index updates to update index status in components
        this.indexSocket.$onIndexUpdate.subscribe((index) => {
            this.updateLocalIndex(index);
        })
    }

    public async createImport(createImportDto: CreateImportDTO): Promise<ImportEntity> {
        return firstValueFrom(this.httpClient.post(`${environment.api_base_uri}/v1/imports`, createImportDto)).then((result: ImportEntity) => {
            this.updateLocalImports(result);
            return result;
        })
    }

    private updateLocalImports(entity: ImportEntity) {
        const imports = this._importsSubject.getValue();
        const index = imports.findIndex((e) => e.id == entity.id);

        console.log("update entity " + entity.id + " to status " + entity.status)
        
        if(index == -1) {
            imports.push(entity);
        } else {
            imports[index] = entity;
        }

        this._importsSubject.next(imports);
    }

    private updateLocalProgress(data: ImportProgressUpdate) {
        const imports = this._importsSubject.getValue();
        const entity = imports.find((e) => e.id == data.importId);
        const index = imports.indexOf(entity);

        if(index == -1) return;

        entity.downloadProgress = data.progress;
        imports[index] = entity;
        this._importsSubject.next(imports);
    }

    private updateLocalIndex(index: Index) {
        const imports = this._importsSubject.getValue();
        const entity = imports.find((e) => e.upgradeIndex?.id == index.id);
        const i = imports.indexOf(entity);

        if(!entity) return;
        
        entity.upgradeIndex = index;
        imports[i] = entity;
        this._importsSubject.next(imports);
    }

    public async findSongsBySpotifyPlaylist(playlistUrl: string): Promise<Page<Song>> {
        return firstValueFrom(this.httpClient.post<any>(`${environment.api_base_uri}/v1/imports/spotify`, { url: playlistUrl }))
    }

}