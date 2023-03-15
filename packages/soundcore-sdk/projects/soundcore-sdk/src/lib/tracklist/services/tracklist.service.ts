import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { SCSDK_OPTIONS } from "../../constants";
import { SCSDKOptions } from "../../scdk.module";
import { ApiResponse } from "../../utils/responses/api-response";
import { apiResponse } from "../../utils/rxjs/operators/api-response";
import { SCSDKTracklist } from "../entities/tracklist.entity";

@Injectable({
    providedIn: "root"
})
export class SCSDKTracklistService {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
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
        const baseUrl = `${this.options.api_base_uri}/v1/tracklists/artist/${artistId}`
        return this.httpClient.get<SCSDKTracklist>(baseUrl).pipe(apiResponse(), map((response) => {
            if(!response || !response.payload) return response;

            response.payload.baseUrl = baseUrl + response.payload.relativeMetaUrl;
            return response;
        }));
    }

    /**
     * Find tracklist entity by an artist's top songs
     * @param artistId Artist's id
     * @returns Tracklist
     */
    public findByArtistTop(artistId: string): Observable<ApiResponse<SCSDKTracklist>> {
        const baseUrl = `${this.options.api_base_uri}/v1/tracklists/artist/top/${artistId}`;
        return this.httpClient.get<SCSDKTracklist>(baseUrl).pipe(apiResponse(), map((response) => {
            if(!response || !response.payload) return response;

            response.payload.baseUrl = baseUrl + response.payload.relativeMetaUrl;
            return response;
        }));
    }

    /**
     * Find tracklist entity by an album
     * @param albumId Album's id
     * @returns Tracklist
     */
    public findByAlbum(albumId: string): Observable<ApiResponse<SCSDKTracklist>> {
        const baseUrl = `${this.options.api_base_uri}/v1/tracklists/album/${albumId}`;
        return this.httpClient.get<SCSDKTracklist>(baseUrl).pipe(apiResponse(), map((response) => {
            if(!response || !response.payload) return response;

            response.payload.baseUrl = baseUrl + response.payload.relativeMetaUrl;
            return response;
        }));
    }

    /**
     * Find tracklist entity by a playlist
     * @param playlistId Playlist's id
     * @returns Tracklist
     */
    public findByPlaylist(playlistId: string): Observable<ApiResponse<SCSDKTracklist>> {
        const baseUrl = `${this.options.api_base_uri}/v1/tracklists/playlist/${playlistId}`;
        return this.httpClient.get<SCSDKTracklist>(baseUrl).pipe(apiResponse(), map((response) => {
            if(!response || !response.payload) return response;

            response.payload.baseUrl = baseUrl + response.payload.relativeMetaUrl;
            return response;
        }));
    }

    /**
     * Find tracklist entity by liked songs
     * @returns Tracklist
     */
    public findByLikedSongs(): Observable<ApiResponse<SCSDKTracklist>> {
        const baseUrl = `${this.options.api_base_uri}/v1/tracklists/liked_songs`;
        return this.httpClient.get<SCSDKTracklist>(baseUrl).pipe(apiResponse(), map((response) => {
            if(!response || !response.payload) return response;

            response.payload.baseUrl = baseUrl + response.payload.relativeMetaUrl;
            return response;
        }));
    }

}
