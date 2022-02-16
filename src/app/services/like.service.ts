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

    public async likeSong(song: Song): Promise<boolean> {
        if(!song) {
            console.log("can't like song: song is null")
            return song.isLiked;
        }
        return firstValueFrom(this.httpClient.post<boolean>(`${environment.api_base_uri}/v1/likes/song/${song.id}`, {})).then((isLiked) => {
            song.isLiked = !!isLiked;

            if(isLiked) {
                this.snackbarService.info("Song wurde deinen Lieblingssongs hinzugefügt.");
            } else {
                this.snackbarService.info("Song wurde von deinen Lieblingssongs entfernt.");
            }

            this._onSongLikeSubject.next(song);
            return song.isLiked;
        }).catch(() => {
            this.snackbarService.error("Ein Fehler ist aufgetreten.");
            return song.isLiked
        })
    }

    public async likePlaylist(playlistId: string): Promise<void> {
        if(!playlistId) return null;
        return firstValueFrom(this.httpClient.post<void>(`${environment.api_base_uri}/v1/likes/playlist/${playlistId}`, {})).then(() => {
            this._onPlaylistLikeSubject.next(playlistId);
        })
    }

}