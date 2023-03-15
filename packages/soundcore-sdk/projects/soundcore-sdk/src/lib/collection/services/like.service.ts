import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, Subject, tap } from "rxjs";
import { SCSDK_OPTIONS } from "../../constants";
import { Page } from "../../pagination/page";
import { Pageable } from "../../pagination/pageable";
import { SCSDKOptions } from "../../scdk.module";
import { Song } from "../../song";
import { Future, toFuture } from "../../utils/future";
import { ToggleLikedSongDTO } from "../dtos/toggle-result.dto";
import { LikedSong } from "../entities/like.entity";

@Injectable({
    providedIn: "root"
})
export class SCSDKLikeService {

    private readonly _onSongLikeChangedSubject: Subject<ToggleLikedSongDTO> = new Subject();
    public readonly $onSongLikeChanged: Observable<ToggleLikedSongDTO> = this._onSongLikeChangedSubject.asObservable();

    constructor(
        private httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) {}

    public toggleLikeForSong(song: Song): Observable<Future<ToggleLikedSongDTO>> {
        return this.httpClient.get<ToggleLikedSongDTO>(`${this.options.api_base_uri}/v1/likes/songs/${song.id}`).pipe(toFuture(), tap((request) => {
            console.log(request);
            if(request.loading || request.error) return;
            this._onSongLikeChangedSubject.next(request.data);
        }));
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