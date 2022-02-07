import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, take } from 'rxjs';
import { Page, Pageable } from 'src/app/pagination/pagination';
import { LikeService } from 'src/app/services/like.service';
import { AuthenticationService } from 'src/app/sso/authentication.service';
import { environment } from 'src/environments/environment';
import { Song } from '../../song/entities/song.entity';
import { CreatePlaylistDTO } from '../dtos/create-playlist.dto';
import { Playlist } from '../entities/playlist.entity';

const PLAYLIST_STORAGE_KEY = "asc_user_playlists"

export interface SongEvent {
  songIds: string[];
  playlistId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  private _playlistsSubject: BehaviorSubject<Playlist[]> = new BehaviorSubject([]);
  public $playlists: Observable<Playlist[]> = this._playlistsSubject.asObservable();

  private _onSongsAddedSubject: BehaviorSubject<SongEvent> = new BehaviorSubject(null);
  private _onSongsRemovedSubject: BehaviorSubject<SongEvent> = new BehaviorSubject(null);

  public $onSongsAdded: Observable<SongEvent> = this._onSongsAddedSubject.asObservable();
  public $onSongsRemoved: Observable<SongEvent> = this._onSongsRemovedSubject.asObservable();

  constructor(
    private httpClient: HttpClient,
    private likeService: LikeService,
    private authService: AuthenticationService
  ) { 
    this.restoreAndFindPlaylists().then((playlists) => {
      this._playlistsSubject.next(playlists)
      this.$playlists.subscribe((playlists) => this.handlePlaylistsUpdateEvent(playlists))
    })

    this.likeService.$onPlaylistLike.subscribe((playlistId) => this.handlePlaylistLikeToggleEvent(playlistId))
  }

  public async findById(playlistId: string): Promise<Playlist> {
    return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/playlists/${playlistId}`)) as Promise<Playlist>
  }

  public async findSongsByPlaylist(playlistId: string, pageable: Pageable): Promise<Page<Song>> {
    return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/playlists/${playlistId}/songs${Pageable.toQuery(pageable)}`)) as Promise<Page<Song>>
  }

  public async findPageByAuthor(authorId: string = "@me"): Promise<Page<Playlist>> {
    return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/playlists/byAuthor/${authorId}`)) as Promise<Page<Playlist>>
  }

  public async addSongs(playlistId: string, songIds: string[]): Promise<void> {
    return firstValueFrom(this.httpClient.put<void>(`${environment.api_base_uri}/v1/playlists/${playlistId}/songs/add`, songIds)).then(() => {
      this._onSongsAddedSubject.next({ songIds, playlistId })
    })
  }

  public async removeSongs(playlistId: string, songIds: string[]): Promise<void> {
    return firstValueFrom(this.httpClient.put<void>(`${environment.api_base_uri}/v1/playlists/${playlistId}/songs/remove`, songIds)).then(() => {
      this._onSongsRemovedSubject.next({ songIds, playlistId })
    })
  }

  public async addCollaborators(playlistId: string, collaboratorIds: string[]): Promise<void> {
    return firstValueFrom(this.httpClient.put<void>(`${environment.api_base_uri}/v1/playlists/${playlistId}/collaborators/add`, collaboratorIds))
  }

  public async removeCollaborators(playlistId: string, collaboratorIds: string[]): Promise<void> {
    return firstValueFrom(this.httpClient.put<void>(`${environment.api_base_uri}/v1/playlists/${playlistId}/collaborators/remove`, collaboratorIds))
  }

  public async create(createPlaylistDto: CreatePlaylistDTO): Promise<Playlist> {
    return (firstValueFrom(this.httpClient.post(`${environment.api_base_uri}/v1/playlists`, createPlaylistDto)) as Promise<Playlist>).then((playlist) => {
      const playlists = this._playlistsSubject.getValue();
      if(playlists.findIndex((p) => p.id == playlist.id) == -1) playlists.push(playlist);
      return playlist;
    })
  }

  public async restoreAndFindPlaylists(): Promise<Playlist[]> {
    // TODO: Restore from localStorage or maybe indexeddb
    return (await this.findAllOfMe()).elements
  }

  public async deleteById(playlistId: string): Promise<void> {
    return firstValueFrom(this.httpClient.delete<void>(`${environment.api_base_uri}/v1/playlists/${playlistId}`)).then(() => {
      this._playlistsSubject.next(this._playlistsSubject.getValue().filter((p) => p.id != playlistId))
    });
  }

  private async findAllOfMe(): Promise<Page<Playlist>> {
    return firstValueFrom(this.httpClient.get<Page<Playlist>>(`${environment.api_base_uri}/v1/playlists/byAuthor/@me`)).catch(() => {
      return Page.of([])
    })
  }

  private async handlePlaylistsUpdateEvent(playlists: Playlist[]): Promise<void> {
    // TODO: Properly save playlists for caching to localStorage or maybe IndexedDB?
  }

  private async handlePlaylistLikeToggleEvent(playlistId: string) {
    const playlist = this._playlistsSubject.getValue().find((p) => p.id == playlistId);
      if(!playlist) {
        // Fetch playlist data and add to playlists
        this.findById(playlistId).then((pl) => {
          this._playlistsSubject.next([
            ...this._playlistsSubject.getValue(),
            pl
          ])
        })
      } else {
        // Remove from playlists if user is not the author
        if(playlist.isLiked) {
          // The data is outdated, so in this case the playlist isn't liked anymore.
          this.authService.$user.pipe(take(1)).subscribe((user) => {
            if(playlist.author?.id != user?.id) {
              this._playlistsSubject.next(this._playlistsSubject.getValue().filter((p) => p.id != playlist.id))
            }
          })
        }
      }
  }

}
