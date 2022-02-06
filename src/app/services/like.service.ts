import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom, Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: "root"
})
export class LikeService {

    private _onPlaylistLikeSubject: BehaviorSubject<string> = new BehaviorSubject(null);
    private _onSongLikeSubject: BehaviorSubject<string> = new BehaviorSubject(null);

    public $onPlaylistLike: Observable<string> = this._onPlaylistLikeSubject.asObservable();
    public $onSongLike: Observable<string> = this._onSongLikeSubject.asObservable();

    constructor(
        private httpClient: HttpClient
    ) {}

    public async likeSong(songId: string): Promise<void> {
        if(!songId) return null;
        return firstValueFrom(this.httpClient.post<void>(`${environment.api_base_uri}/v1/likes/song/${songId}`, {})).then(() => {
            this._onSongLikeSubject.next(songId);
        })
    }

    public async likePlaylist(playlistId: string): Promise<void> {
        if(!playlistId) return null;
        return firstValueFrom(this.httpClient.post<void>(`${environment.api_base_uri}/v1/likes/playlist/${playlistId}`, {})).then(() => {
            this._onPlaylistLikeSubject.next(playlistId);
        })
    }

}