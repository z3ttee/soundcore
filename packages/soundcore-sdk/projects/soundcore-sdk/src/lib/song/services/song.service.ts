import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Page } from "../../utils/page/page";
import { Pageable } from "../../utils/page/pageable";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { Song } from "../entities/song.entity";
import { ApiResponse } from "../../utils/responses/api-response";
import { apiResponse } from "../../utils/rxjs/operators/api-response";
import { ApiSearchResponse } from "../../meilisearch/entities/search-response.entity";
import { MeiliSong } from "../../meilisearch/entities/meili-song.entity";

@Injectable({
    providedIn: "root"
})
export class SCDKSongService {

    constructor(
        private httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

    /**
     * Find the top songs by an artist.
     * @param artistId Artist's id
     * @returns Observable<Page<Song>>
     */
    public findTopSongsByArtist(artistId: string): Observable<ApiResponse<Page<Song>>> {
        if(!artistId) return of(ApiResponse.withPayload(null));
        return this.httpClient.get<Page<Song>>(`${this.options.api_base_uri}/v1/songs/byArtist/${artistId}/top`).pipe(apiResponse())
    }

    /**
     * Find songs by an artist categorized in a specific genre.
     * @param genreId Genre's id
     * @param artistId Artist's id
     * @param pageable Page settings
     * @returns Observable<Page<Song>>
     */
    public findSongsByGenreAndArtist(genreId: string, artistId: string, pageable: Pageable): Observable<ApiResponse<Page<Song>>> {
        if(!genreId || !artistId) return of(ApiResponse.withPayload(Page.of([])))
        return this.httpClient.get<Page<Song>>(`${this.options.api_base_uri}/v1/songs/byGenre/${genreId}/byArtist/${artistId}${pageable.toQuery()}`).pipe(apiResponse());
    }

    /**
     * Find songs of the user's collection
     * @param pageable Page settings
     * @returns Observable<Page<Song>>
     */
    public findSongsByCollection(pageable: Pageable): Observable<ApiResponse<Page<Song>>> {
        return this.httpClient.get<Page<Song>>(`${this.options.api_base_uri}/v1/songs/byCollection${pageable.toQuery()}`).pipe(apiResponse());
    }

    /**
     * Find song by an artist and which the user has added to his collection.
     * @param artistId Artist's id
     * @param pageable Page settings
     * @returns 
     */
    public findSongsByCollectionAndArtist(artistId: string, pageable: Pageable): Observable<ApiResponse<Page<Song>>> {
        if(!artistId) return of(ApiResponse.withPayload(Page.of([])))
        return this.httpClient.get<Page<Song>>(`${this.options.api_base_uri}/v1/songs/byCollection/byArtist/${artistId}${pageable.toQuery()}`).pipe(apiResponse());
    }

    /**
     * Search songs by a given query.
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {ApiResponse<ApiSearchResponse<MeiliSong>>} ApiResponse<ApiSearchResponse<MeiliSong>> 
     */
    public searchSongs(query: string, pageable: Pageable): Observable<ApiResponse<ApiSearchResponse<MeiliSong>>> {
        return this.httpClient.get<ApiSearchResponse<MeiliSong>>(`${this.options.api_base_uri}/v1/search/songs/?q=${query}&${pageable.toParams()}`).pipe(apiResponse());
    }

}