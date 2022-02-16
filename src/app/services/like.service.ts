import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom, Observable, Subject } from "rxjs";
import { environment } from "src/environments/environment";
import { Playlist } from "../features/playlist/entities/playlist.entity";
import { Song } from "../features/song/entities/song.entity";
import { SnackbarService } from "./snackbar.service";

@Injectable({
    providedIn: "root"
})
export class LikeService {

    private _onPlaylistLikeSubject: Subject<Playlist> = new Subject();
    private _onSongLikeSubject: Subject<Song> = new Subject();

    public $onPlaylistLike: Observable<Playlist> = this._onPlaylistLikeSubject.asObservable();
    public $onSongLike: Observable<Song> = this._onSongLikeSubject.asObservable();

    constructor(
        private httpClient: HttpClient,
        private snackbarService: SnackbarService
    ) {}

    public async likeSong(song: Song): Promise<boolean> {
        if(!song) return song?.isLiked;
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

    public async likePlaylist(playlist: Playlist): Promise<boolean> {
        if(!playlist?.id) return playlist?.isLiked;
        return firstValueFrom(this.httpClient.post<boolean>(`${environment.api_base_uri}/v1/likes/playlist/${playlist.id}`, {})).then((isLiked) => {
            playlist.isLiked = !!isLiked;

            if(isLiked) {
                this.snackbarService.info("Playlist wurde deiner Bibliothek hinzugefügt");
            } else {
                this.snackbarService.info("Playlist wurde von deiner Bibliothek entfernt.");
            }

            this._onPlaylistLikeSubject.next(playlist);
            return playlist.isLiked;
        }).catch(() => {
            this.snackbarService.error("Ein Fehler ist aufgetreten.");
            return playlist?.isLiked
        })
    }

}