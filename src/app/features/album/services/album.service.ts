import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom, Observable, of } from "rxjs";
import { Page } from "src/app/pagination/pagination";
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
    public async findById(albumId: string): Promise<Album> {
        if(!albumId) return null;
        return firstValueFrom(this.httpClient.get<Album>(`${environment.api_base_uri}/v1/albums/${albumId}`))
    }

    /**
     * Find a page of recommended albums by an artist.
     * This returns aprox. 10 Albums.
     * @param artistId Artist's id
     * @returns Page<Album>
     */
    public async findRecommendedByArtist(artistId: string, exceptAlbumIds: string[] = []): Promise<Page<Album>> {
        if(!artistId) return Page.of([]);

        const query = new URLSearchParams()
        for(const except of exceptAlbumIds) {
            query.append("except", except);
        }

        return firstValueFrom(this.httpClient.get<Page<Album>>(`${environment.api_base_uri}/v1/albums/byArtist/${artistId}/recommended?${query}`))
    }

}