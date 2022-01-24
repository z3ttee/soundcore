import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom, Observable, of } from "rxjs";
import { environment } from "src/environments/environment";
import { Album } from "../entities/album.entity";

@Injectable()
export class AlbumService {

    constructor(
        private httpClient: HttpClient
    ) {}

    /**
     * Find album by its id
     * @param albumId Album's id
     * @returns Album
     */
    public findById(albumId: string): Promise<Album> {
        if(!albumId) return null;
        return firstValueFrom(this.httpClient.get<Album>(`${environment.api_base_uri}/v1/albums/${albumId}`))
    }

}