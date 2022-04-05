import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom, Observable, of } from "rxjs";
import { Page, Pageable } from "src/app/pagination/pagination";
import { environment } from "src/environments/environment";
import { Album } from "../entities/album.entity";

@Injectable({
    providedIn: "root"
})
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

    /**
     * Find playlists by genre.
     * @param genreId Genre's id
     * @param pageable Page settings
     * @returns Observable<Page<Album>>
     */
    public findByGenre(genreId: string, pageable: Pageable): Observable<Page<Album>> {
        if(!genreId) return of(Page.of([]));
        return this.httpClient.get<Page<Album>>(`${environment.api_base_uri}/v1/albums/byGenre/${genreId}${Pageable.toQuery(pageable)}`)
    }

    /**
     * Find albums by an artist.
     * @param artistId Artist's id
     * @param pageable Page settings
     * @returns Observable<Page<Album>>
     */
    public findByArtist(artistId: string, pageable: Pageable): Observable<Page<Album>> {
        if(!artistId) return of(Page.of([]));
        return this.httpClient.get<Page<Album>>(`${environment.api_base_uri}/v1/albums/byArtist/${artistId}${Pageable.toQuery(pageable)}`)
    }

    /**
     * Find albums that feature an artist.
     * @param artistId Artist's id
     * @param pageable Page settings
     * @returns Observable<Page<Album>>
     */
    public findFeaturedAlbumsByArtist(artistId: string, pageable: Pageable): Observable<Page<Album>> {
        if(!artistId) return of(Page.of([]));
        return this.httpClient.get<Page<Album>>(`${environment.api_base_uri}/v1/albums/byFeaturedArtist/${artistId}${Pageable.toQuery(pageable)}`)
    }

}