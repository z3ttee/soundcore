import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
<<<<<<< HEAD
import { SCSDKOptions, SCSDK_OPTIONS } from "../../scdk.module";
=======
import { SCSDKOptions } from "../../scdk.module";
>>>>>>> main
import { Song } from "../entities/song.entity";
import { ApiResponse } from "../../utils/responses/api-response";
import { apiResponse } from "../../utils/rxjs/operators/api-response";
import { ApiSearchResponse } from "../../meilisearch/entities/search-response.entity";
import { MeiliSong } from "../../meilisearch/entities/meili-song.entity";
import { Page, Pageable } from "../../pagination";
import { Future, toFuture } from "../../utils/future";
import { SCSDK_OPTIONS } from "../../constants";

@Injectable()
export class SCSDKSongService {

    constructor(
        private httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) {}

    /**
     * Find a song by its id.
     * @param songId Song's id
     * @returns Future<Song>
     */
    public findById(songId: string): Observable<Future<Song>> {
        if(!songId) return of(Future.notfound());
        return this.httpClient.get<Song>(`${this.options.api_base_uri}/v1/songs/${songId}`).pipe(toFuture());
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
     * Search songs by a given query.
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {ApiResponse<ApiSearchResponse<MeiliSong>>} ApiResponse<ApiSearchResponse<MeiliSong>> 
     */
    public searchSongs(query: string, pageable: Pageable): Observable<ApiResponse<ApiSearchResponse<MeiliSong>>> {
        return this.httpClient.get<ApiSearchResponse<MeiliSong>>(`${this.options.api_base_uri}/v1/search/songs/?q=${query}&${pageable.toParams()}`).pipe(apiResponse());
    }

}