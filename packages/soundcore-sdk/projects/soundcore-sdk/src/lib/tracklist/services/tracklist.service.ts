import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { ApiResponse } from "../../utils/responses/api-response";
import { apiResponse } from "../../utils/rxjs/operators/api-response";
import { SCSDKTracklist } from "../entities/tracklist.entity";

@Injectable({
    providedIn: "root"
})
export class SCSDKTracklistService {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

    public getHttpClient(): HttpClient {
        return this.httpClient;
    }

    /**
     * Find tracklist entity by an artist
     * @param artistId Artist's id
     * @returns Tracklist
     */
    public findByArtist(artistId: string): Observable<ApiResponse<SCSDKTracklist>> {
        return this.httpClient.get<SCSDKTracklist>(`${this.options.api_base_uri}/v1/tracklists/artist/${artistId}`).pipe(apiResponse());
    }

    /**
     * Find tracklist entity by an artist's top songs
     * @param artistId Artist's id
     * @returns Tracklist
     */
    public findByArtistTop(artistId: string): Observable<ApiResponse<SCSDKTracklist>> {
        return this.httpClient.get<SCSDKTracklist>(`${this.options.api_base_uri}/v1/tracklists/artist/top/${artistId}`).pipe(apiResponse());
    }

    /**
     * Find tracklist entity by an album
     * @param albumId Album's id
     * @returns Tracklist
     */
    public findByAlbum(albumId: string): Observable<ApiResponse<SCSDKTracklist>> {
        return this.httpClient.get<SCSDKTracklist>(`${this.options.api_base_uri}/v1/tracklists/album/${albumId}`).pipe(apiResponse());
    }

    /**
     * Find tracklist entity by a playlist
     * @param playlistId Playlist's id
     * @returns Tracklist
     */
    public findByPlaylist(playlistId: string): Observable<ApiResponse<SCSDKTracklist>> {
        return this.httpClient.get<SCSDKTracklist>(`${this.options.api_base_uri}/v1/tracklists/playlist/${playlistId}`).pipe(apiResponse());
    }

    /**
     * Find tracklist entity by liked songs
     * @returns Tracklist
     */
    public findByLikedSongs(): Observable<ApiResponse<SCSDKTracklist>> {
        return this.httpClient.get<SCSDKTracklist>(`${this.options.api_base_uri}/v1/tracklists/liked_songs`).pipe(apiResponse());
    }

}
