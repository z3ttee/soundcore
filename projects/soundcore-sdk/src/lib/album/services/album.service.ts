import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { Page } from "../../pagination/page";
import { Pageable } from "../../pagination/pageable";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { Album } from "../entities/album.entity";

@Injectable()
export class SCDKAlbumService {

    private _collectionSubject: BehaviorSubject<Album[]> = new BehaviorSubject([]);
    public $collection: Observable<Album[]> = this._collectionSubject.asObservable();

    constructor(
        private httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {
        console.log("album service init")
    }

    /**
     * Find album by its id.
     * @param albumId Album's id
     * @returns Observable<Album>
     */
    public findById(albumId: string): Observable<Album> {
        if(!albumId) return null;
        return this.httpClient.get<Album>(`${this.options.api_base_uri}/v1/albums/${albumId}`)
    }

    /**
     * Find a page of recommended albums by an artist.
     * This returns aprox. 10 Albums.
     * @param artistId Artist's id
     * @returns Page<Album>
     */
    public findRecommendedByArtist(artistId: string, seed: string[] = []): Observable<Page<Album>> {
        if(!artistId) return of(Page.of([]));

        const query = new URLSearchParams()
        for(const except of seed) {
            query.append("except", except);
        }

        return this.httpClient.get<Page<Album>>(`${this.options.api_base_uri}/v1/albums/byArtist/${artistId}/recommended?${query}`)
    }

    /**
     * Find page of albums by an artist.
     * @param artistId Artist's id.
     * @param pageable Page settings
     * @returns Observable<Page<Album>>
     */
    public findByArtist(artistId: string, pageable: Pageable): Observable<Page<Album>> {
        if(!artistId) return of(Page.of([]));
        return this.httpClient.get<Page<Album>>(`${this.options.api_base_uri}/v1/albums/byArtist/${artistId}${Pageable.toQuery(pageable)}`)
    }

    /**
     * Find a page of albums that contains at least one song
     * of a specific artist.
     * @param artistId Artist's id.
     * @param pageable Page settings
     * @returns Observable<Page<Album>>
     */
    public findFeaturedByArtist(artistId: string, pageable: Pageable): Observable<Page<Album>> {
        if(!artistId) return of(Page.of([]));
        return this.httpClient.get<Page<Album>>(`${this.options.api_base_uri}/v1/albums/byFeaturedArtist/${artistId}${Pageable.toQuery(pageable)}`)
    }

}