import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Page, Pageable } from "../../pagination";
import { BehaviorSubject, Observable, of } from "rxjs";
import { MeiliAlbum } from "../../meilisearch/entities/meili-album.entity";
import { ApiSearchResponse } from "../../meilisearch/entities/search-response.entity";
import { SCSDKOptions } from "../../scdk.module";
import { ApiResponse } from "../../utils/responses/api-response";
import { apiResponse } from "../../utils/rxjs/operators/api-response";
import { Album } from "../entities/album.entity";
import { SCSDK_OPTIONS } from "../../constants";

@Injectable()
export class SCDKAlbumService {

    private readonly _collectionSubject: BehaviorSubject<Album[]> = new BehaviorSubject([]);
    public readonly $collection: Observable<Album[]> = this._collectionSubject.asObservable();

    constructor(
        private httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) {}

    /**
     * Find album by its id.
     * @param albumId Album's id
     * @returns Observable<Album>
     */
    public findById(albumId: string): Observable<ApiResponse<Album>> {
        if(!albumId) return of(ApiResponse.withPayload(null));
        return this.httpClient.get<Album>(`${this.options.api_base_uri}/v1/albums/${albumId}`).pipe(apiResponse())
    }

    /**
     * Find a page of recommended albums by an artist.
     * This returns aprox. 10 Albums.
     * @param artistId Artist's id
     * @returns Page<Album>
     */
    public findRecommendedByArtist(artistId: string, seed: string[] = []): Observable<ApiResponse<Page<Album>>> {
        if(!artistId) return of(ApiResponse.withPayload(Page.of([])));

        const query = new URLSearchParams()
        for(const except of seed) {
            query.append("except", except);
        }

        return this.httpClient.get<Page<Album>>(`${this.options.api_base_uri}/v1/albums/byArtist/${artistId}/recommended?${query}`).pipe(apiResponse())
    }

    /**
     * Find page of albums by an artist.
     * @param artistId Artist's id.
     * @param pageable Page settings
     * @returns Observable<Page<Album>>
     */
    public findByArtist(artistId: string, pageable: Pageable): Observable<ApiResponse<Page<Album>>> {
        if(!artistId) return of(ApiResponse.withPayload(Page.of([])));
        return this.httpClient.get<Page<Album>>(`${this.options.api_base_uri}/v1/albums/byArtist/${artistId}${pageable.toQuery()}`).pipe(apiResponse())
    }

    /**
     * Find a page of albums that contains at least one song
     * of a specific artist.
     * @param artistId Artist's id.
     * @param pageable Page settings
     * @returns Observable<Page<Album>>
     */
    public findFeaturedByArtist(artistId: string, pageable: Pageable): Observable<ApiResponse<Page<Album>>> {
        if(!artistId) return of(ApiResponse.withPayload(Page.of([])));
        return this.httpClient.get<Page<Album>>(`${this.options.api_base_uri}/v1/albums/byFeaturedArtist/${artistId}${pageable.toQuery()}`).pipe(apiResponse())
    }

    /**
     * Search albums by a given query.
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {ApiResponse<ApiSearchResponse<MeiliAlbum>>} ApiResponse<ApiSearchResponse<MeiliArtist>> 
     */
    public searchAlbum(query: string, pageable: Pageable): Observable<ApiResponse<ApiSearchResponse<MeiliAlbum>>> {
        return this.httpClient.get<ApiSearchResponse<MeiliAlbum>>(`${this.options.api_base_uri}/v1/search/albums/?q=${query}&${pageable.toParams()}`).pipe(apiResponse());
    }

}