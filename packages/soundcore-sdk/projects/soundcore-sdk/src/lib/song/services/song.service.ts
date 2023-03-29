import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { SCSDKOptions } from "../../scdk.module";
import { Song } from "../entities/song.entity";
import { ApiResponse } from "../../utils/responses/api-response";
import { apiResponse } from "../../utils/rxjs/operators/api-response";
import { ApiSearchResponse } from "../../meilisearch/entities/search-response.entity";
import { MeiliSong } from "../../meilisearch/entities/meili-song.entity";
import { Future, toFuture } from "../../utils/future";
import { SCSDK_OPTIONS } from "../../constants";
import { Page, Pageable } from "@soundcore/common";
import { SCSDKDatasource } from "../../utils/datasource";

@Injectable()
export class SCSDKSongService {

    constructor(
        private httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) {}

    /**
     * Find a song by its id.
     * @param songId Song's id
     * @returns {Future<Song>}
     */
    public findById(songId: string): Observable<Future<Song>> {
        if(!songId) return of(Future.notfound());
        return this.httpClient.get<Song>(`${this.options.api_base_uri}/v1/songs/${songId}`).pipe(toFuture());
    }    

    /**
     * Find a page of songs that belong to an album
     * @param albumId Id of the album
     * @param pageable Page settings
     * @returns {Future<Page<Song>>}
     */
    public findByAlbum(albumId: string, pageable: Pageable): Observable<Future<Page<Song>>> {
        if(!albumId) return of(Future.notfound());
        return this.httpClient.get<Page<Song>>(`${this.options.api_base_uri}/v1/songs/album/${albumId}${pageable.toQuery()}`).pipe(toFuture());
    }

    /**
     * Create datasource that contains songs that belong to an album
     * @param albumId Id of the album
     * @returns {SCSDKDatasource<Song>}
     */
    public findByAlbumDatasource(albumId: string, initialSize?: number, pageSize?: number): Observable<SCSDKDatasource<Song>> {
        return of(new SCSDKDatasource(this.httpClient, `${this.options.api_base_uri}/v1/songs/album/${albumId}`, initialSize, pageSize));
    }

    /**
     * Create datasource that contains songs that belong to an artist
     * @param artistId Id of the artist
     * @returns {SCSDKDatasource<Song>}
     */
    public findByArtistDatasource(artistId: string, initialSize?: number, pageSize?: number): Observable<SCSDKDatasource<Song>> {
        return of(new SCSDKDatasource(this.httpClient, `${this.options.api_base_uri}/v1/songs/artist/${artistId}`, initialSize, pageSize));
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