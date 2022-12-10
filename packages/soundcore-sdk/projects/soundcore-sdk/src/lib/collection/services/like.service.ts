import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Page } from "../../pagination/page";
import { Pageable } from "../../pagination/pageable";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { Future, toFuture } from "../../utils/future";
import { LikedSong } from "../entities/like.entity";

@Injectable()
export class SCSDKLikeService {

    constructor(
        private httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

    public toggleLikeForSong(songId: string): Observable<Future<boolean>> {
        return this.httpClient.get<boolean>(`${this.options.api_base_uri}/v1/likes/songs/${songId}`).pipe(toFuture());
    }

    public toggleLikeForPlaylist(playlistId: string): Observable<Future<boolean>> {
        return this.httpClient.get<boolean>(`${this.options.api_base_uri}/v1/likes/playlists/${playlistId}`).pipe(toFuture());
    }

    public toggleLikeForAlbum(albumId: string): Observable<Future<boolean>> {
        return this.httpClient.get<boolean>(`${this.options.api_base_uri}/v1/likes/albums/${albumId}`).pipe(toFuture());
    }

    public findPageByLikedSongs(pageable: Pageable): Observable<Future<Page<LikedSong>>> {
        return this.httpClient.get<Page<LikedSong>>(`${this.getUrl("findPageByLikedSongs")}${pageable.toQuery()}`).pipe(toFuture());
    }

    public getUrl(fnName: "findPageByLikedSongs"): string {
        if(fnName == "findPageByLikedSongs") {
            return `${this.options.api_base_uri}/v1/likes/songs`;
        } else {
            return null;
        }
    }

}