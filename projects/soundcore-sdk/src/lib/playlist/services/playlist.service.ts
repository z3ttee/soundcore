import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, Observable, of, Subject, tap } from "rxjs";
import { Page } from "../../pagination/page";
import { Pageable } from "../../pagination/pageable";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { Song } from "../../song/entities/song.entity";
import { SCResourceMap } from "../../utils/structures/resource-map";
import { CreatePlaylistDTO } from "../dtos/create-playlist.dto";
import { UpdatePlaylistDTO } from "../dtos/update-playlist.dto";
import { Playlist } from "../entities/playlist.entity";
import { PlaylistEvent } from "../events/playlist.event";
import { PlaylistSongsEvent } from "../events/songs.event";

@Injectable({
    providedIn: "root"
})
export class SCDKPlaylistService {

    private readonly _playlistsMap: SCResourceMap<Playlist> = new SCResourceMap();
    private readonly _playlistsSubject: BehaviorSubject<Playlist[]> = new BehaviorSubject([]);
    public readonly $playlists: Observable<Playlist[]> = this._playlistsSubject.asObservable();

    private readonly _onSongsEventSubject: Subject<PlaylistSongsEvent> = new Subject();
    private readonly _onEventSubject: Subject<PlaylistEvent> = new Subject();

    /**
     * Observable that emits events if a song of playlist was added or removed.
     */
     public readonly $songEvents: Observable<PlaylistSongsEvent> = this._onSongsEventSubject.asObservable();

     /**
      * Observable that emits events if a playlist was created or removed from the $playlists observable.
      */
     public readonly $events: Observable<PlaylistEvent> = this._onEventSubject.asObservable();

    constructor(
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions,
        private httpClient: HttpClient
    ) { }

    /**
     * Find a playlist by its id.
     * @param playlistId Playlist's id.
     * @returns Observable<Playlist>
     */
    public findById(playlistId: string): Observable<Playlist> {
        if(!playlistId) return of(null);
        return this.httpClient.get<Playlist>(`${this.options.api_base_uri}/v1/playlists/${playlistId}`);
    }

    /**
     * Find playlists created by an author.
     * The result may depend on the requester's permissions. Insufficient permissions
     * can result in a reduced result set, as private and not-listed playlists
     * will be filtered out.
     * @param authorId Author's id.
     * @param pageable Page settings
     * @returns Observable<Page<Playlist>>
     */
    public findByAuthor(authorId: string, pageable: Pageable): Observable<Page<Playlist>> {
        if(!authorId) return of(Page.of([]));
        return this.httpClient.get<Page<Playlist>>(`${this.options.api_base_uri}/v1/playlists/byAuthor/${authorId}`)
    }

    /**
     * Find all playlist by the current user.
     * The API expects an authorization header with a valid Bearer token.
     * So please consider adding a proper header to that request.
     * @returns Observable<Page<Playlist>>
     */
    public findByCurrentUser(): Observable<Page<Playlist>> {
        return this.httpClient.get<Page<Playlist>>(`${this.options.api_base_uri}/v1/playlists/@me`).pipe(tap((page) => {
            if(!page) return;
            for(const playlist of page.elements) {
                this._playlistsMap.set(playlist);
            }
            
            this._playlistsSubject.next(this._playlistsMap.items());
        }))
    }

    /**
     * Find playlists containing songs of a specific artist.
     * @param artistId Artist's id.
     * @param pageable Page settings
     * @returns Observable<Page<Playlist>>
     */
    public findByArtist(artistId: string, pageable: Pageable): Observable<Page<Playlist>> {
        if(!artistId) return of(Page.of([]));
        return this.httpClient.get<Page<Playlist>>(`${this.options.api_base_uri}/v1/playlists/byArtist/${artistId}${Pageable.toQuery(pageable)}`)
    }

    /**
     * Find playlist by a genre.
     * @param genreId Genre's id
     * @returns Observable<Page<Playlist>>
     */
    public findByGenre(genreId: string): Observable<Page<Playlist>> {
        if(!genreId) return of(Page.of([]));
        return this.httpClient.get<Page<Playlist>>(`${this.options.api_base_uri}/v1/playlists/byGenre/${genreId}`)
    }

    /**
     * Create a new playlist. This will add the created playlist 
     * to the $playlists observable on success.
     * @param createPlaylistDto Playlist data to create.
     * @returns Observable<Playlist>
     */
    public createPlaylist(createPlaylistDto: CreatePlaylistDTO): Observable<Playlist> {
        if(!createPlaylistDto) return null;
        return this.httpClient.post<Playlist>(`${this.options.api_base_uri}/v1/playlists`, createPlaylistDto).pipe(
            catchError((err) => {
                throw err;
            }),
            tap((playlist) => {
                this._playlistsMap.set(playlist);
                this._playlistsSubject.next(this._playlistsMap.items());
                this._onEventSubject.next(new PlaylistEvent("added", playlist));
            })
        )
    }

    /**
     * Delete a playlist by its id. This will remove the playlist
     * from the $playlists observable on success.
     * @param playlistId Playlist's id.
     * @returns Observable<void>
     */
    public deleteById(playlistId: string): Observable<void> {
        if(!playlistId) return of();
        return this.httpClient.delete<any>(`${this.options.api_base_uri}/v1/playlists/${playlistId}`).pipe(
            catchError((err) => {
                throw err;
            }),
            tap(() => {
                const playlist = this._playlistsMap.remove(playlistId);
                this._playlistsSubject.next(this._playlistsMap.items());
                this._onEventSubject.next(new PlaylistEvent("removed", playlist));
            })
        )
    }


    /**
     * Add songs to a playlist.
     * @param playlistId Playlist's id.
     * @param songs Songs to add to the playlist.
     * @returns Observable<Playlist>
     */
    public addSongs(playlistId: string, songs: Song[]): Observable<Playlist> {
        if(!playlistId) return of(null);
        return this.httpClient.put<Playlist>(`${this.options.api_base_uri}/v1/playlists/${playlistId}/songs/add`, songs.map((song) => song?.id)).pipe(
            catchError((err) => {
                throw err;
            }),
            tap(() => {
                const playlist = this._playlistsMap.get(playlistId);
                this._onSongsEventSubject.next(new PlaylistSongsEvent("added", playlist, songs));
            })
        )
    }

    /**
     * Remove songs from a playlist.
     * @param playlistId Playlist's id.
     * @param songs Songs to remove from the playlist.
     * @returns Observable<Playlist>
     */
    public removeSongs(playlistId: string, songs: Song[]): Observable<Playlist> {
        if(!playlistId) return of(null);
        return this.httpClient.put<Playlist>(`${this.options.api_base_uri}/v1/playlists/${playlistId}/songs/remove`, songs.map((song) => song?.id)).pipe(
            catchError((err) => {
                throw err;
            }),
            tap(() => {
                const playlist = this._playlistsMap.get(playlistId);
                this._onSongsEventSubject.next(new PlaylistSongsEvent("removed", playlist, songs));
            })
        )
    }

    public updatePlaylist(playlistId: string, updatePlaylistDto: UpdatePlaylistDTO): Observable<Playlist> {
        return this.httpClient.put<Playlist>(`${this.options.api_base_uri}/v1/playlists/${playlistId}`, updatePlaylistDto).pipe(
            catchError((err) => {
                throw err;
            }),
            tap((playlist) => {
                this._playlistsMap.set(playlist)
                this._onEventSubject.next(new PlaylistEvent("updated", playlist));
                this._playlistsSubject.next(this._playlistsMap.items());
            })
        )
    }



}