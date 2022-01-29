import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { Page } from "src/app/pagination/pagination";
import { environment } from "src/environments/environment";
import { Song } from "../../song/entities/song.entity";
import { Collection } from "../entities/collection.entity";

@Injectable()
export class CollectionService {

    constructor(private httpClient: HttpClient) {}

    public async findCollection(): Promise<Collection> {
        return firstValueFrom(this.httpClient.get<Collection>(`${environment.api_base_uri}/v1/collections`))
    }

    public async findSongsByCollection(): Promise<Page<Song>> {
        return firstValueFrom(this.httpClient.get<Page<Song>>(`${environment.api_base_uri}/v1/songs/byCollection`))
    }

}