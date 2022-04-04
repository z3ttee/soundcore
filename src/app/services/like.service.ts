import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom, Observable, Subject } from "rxjs";
import { Playlist } from "soundcore-sdk";
import { environment } from "src/environments/environment";
import { Album } from "../features/album/entities/album.entity";
import { Song } from "../features/song/entities/song.entity";
import { SnackbarService } from "./snackbar.service";

@Injectable({
    providedIn: "root"
})
export class LikeService {

    private _onPlaylistLikeSubject: Subject<Playlist> = new Subject();
    private _onSongLikeSubject: Subject<Song> = new Subject();
    private _onAlbumLikeSubject: Subject<Album> = new Subject();

    public $onPlaylistLike: Observable<Playlist> = this._onPlaylistLikeSubject.asObservable();
    public $onAlbumLike: Observable<Album> = this._onAlbumLikeSubject.asObservable();
    public $onSongLike: Observable<Song> = this._onSongLikeSubject.asObservable();

    constructor(
        private httpClient: HttpClient,
        private snackbarService: SnackbarService
    ) {}

    public async likeSong(song: Song): Promise<boolean> {
        if(!song) return song?.liked;

        return this.likeResource(song.id, "song", song.liked).then((isLiked) => {
            song.liked = isLiked;

            if(isLiked) this.snackbarService.info("Song wurde deinen Lieblingssongs hinzugefügt.");
            else this.snackbarService.info("Song wurde von deinen Lieblingssongs entfernt.");

            this._onSongLikeSubject.next(song);
            return song.liked;
        }).catch(() => false)
    }

    public async likePlaylist(playlist: Playlist): Promise<boolean> {
        if(!playlist?.id) return playlist?.liked;

        return this.likeResource(playlist.id, "playlist", playlist.liked).then((isLiked) => {
            playlist.liked = isLiked;

            if(isLiked) this.snackbarService.info("Playlist wurde deiner Bibliothek hinzugefügt");
            else this.snackbarService.info("Playlist wurde von deiner Bibliothek entfernt.");

            this._onPlaylistLikeSubject.next(playlist);
            return playlist.liked;
        }).catch(() => false)
    }

    public async likeAlbum(album: Album): Promise<boolean> {
        if(!album?.id) return album?.liked;

        return this.likeResource(album.id, "album", album.liked).then((isLiked) => {
            album.liked = isLiked;

            if(isLiked) this.snackbarService.info("Album wurde deiner Bibliothek hinzugefügt");
            else this.snackbarService.info("Album wurde von deiner Bibliothek entfernt.");

            this._onAlbumLikeSubject.next(album);
            return album.liked;
        }).catch(() => false)
    }

    private async likeResource(resourceId: string, resourceType: "album" | "playlist" | "song", defaultValue: boolean): Promise<boolean> {
        return firstValueFrom(this.httpClient.post<boolean>(`${environment.api_base_uri}/v1/likes/${resourceType}/${resourceId}`, {})).then((isLiked) => {
            return isLiked;
        }).catch((error: Error) => {
            this.snackbarService.error("Ein Fehler ist aufgetreten.");
            throw error;
        })
    }

}