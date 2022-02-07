import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom, Observable, Subject } from "rxjs";
import { environment } from "src/environments/environment";
import { Song } from "../features/song/entities/song.entity";
import { SnackbarService } from "./snackbar.service";

@Injectable({
    providedIn: "root"
})
export class LikeService {

    private _onPlaylistLikeSubject: BehaviorSubject<string> = new BehaviorSubject(null);
    private _onSongLikeSubject: Subject<Song> = new Subject();

    public $onPlaylistLike: Observable<string> = this._onPlaylistLikeSubject.asObservable();
    public $onSongLike: Observable<Song> = this._onSongLikeSubject.asObservable();

    constructor(
        private httpClient: HttpClient,
        private snackbarService: SnackbarService
    ) {}

    public async likeSong(song: Song): Promise<void> {
        if(!song) return null;
        return firstValueFrom(this.httpClient.post<void>(`${environment.api_base_uri}/v1/likes/song/${song.id}`, {})).then(() => {
            if(song.isLiked) this.snackbarService.info("Song wurde von deinen Lieblingssongs entfernt.");
            else this.snackbarService.info("Song wurde deinen Lieblingssongs hinzugefügt.");

            song.isLiked = !song.isLiked;
            this._onSongLikeSubject.next(song);
        })
    }

    public async likePlaylist(playlistId: string): Promise<void> {
        if(!playlistId) return null;
        return firstValueFrom(this.httpClient.post<void>(`${environment.api_base_uri}/v1/likes/playlist/${playlistId}`, {})).then(() => {
            this._onPlaylistLikeSubject.next(playlistId);
        })
    }

}