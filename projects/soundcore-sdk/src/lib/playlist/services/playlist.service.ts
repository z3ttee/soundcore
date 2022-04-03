import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { Playlist } from "../entities/playlist.entity";

@Injectable()
export class SCDKPlaylistService {

    constructor(
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions,
        private httpClient: HttpClient
    ) {}

    public findById(playlistId: string): Observable<Playlist> {
        if(!playlistId) return of(null);
        return this.httpClient.get<Playlist>(`${this.options.api_base_uri}/v1/playlists/${playlistId}`);
    }

}