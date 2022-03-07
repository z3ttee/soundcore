import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, Subject, take } from 'rxjs';
import { AscPlaylistEditorOptions } from 'src/app/components/dialogs/playlist-editor-dialog/dto/playlist-editor-options.dto';
import { AscPlaylistEditorDialogComponent } from 'src/app/components/dialogs/playlist-editor-dialog/playlist-editor-dialog.component';
import { Page, Pageable } from 'src/app/pagination/pagination';
import { DialogService } from 'src/app/services/dialog.service';
import { LikeService } from 'src/app/services/like.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { AuthenticationService } from 'src/app/sso/authentication.service';
import { environment } from 'src/environments/environment';
import { Song } from '../../song/entities/song.entity';
import { CreatePlaylistDTO } from '../dtos/create-playlist.dto';
import { UpdatePlaylistDTO } from '../dtos/update-playlist.dto';
import { Playlist } from '../entities/playlist.entity';

const PLAYLIST_STORAGE_KEY = "asc_user_playlists"

export interface SongEvent {
  songs: Song[];
  playlistId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  private _playlistsSubject: BehaviorSubject<Playlist[]> = new BehaviorSubject([]);
  public $playlists: Observable<Playlist[]> = this._playlistsSubject.asObservable();

  private _onSongsAddedSubject: Subject<SongEvent> = new Subject();
  private _onSongsRemovedSubject: Subject<SongEvent> = new Subject();

  public $onSongsAdded: Observable<SongEvent> = this._onSongsAddedSubject.asObservable();
  public $onSongsRemoved: Observable<SongEvent> = this._onSongsRemovedSubject.asObservable();

  constructor(
    private httpClient: HttpClient,
    private likeService: LikeService,
    private authService: AuthenticationService,
    private dialogService: DialogService,
    private snackbarService: SnackbarService
  ) { 
    this.restoreAndFindPlaylists().then((playlists) => {
      this._playlistsSubject.next(playlists)
      this.$playlists.subscribe((playlists) => this.handlePlaylistsUpdateEvent(playlists))
    })

    this.likeService.$onPlaylistLike.subscribe((playlist) => this.handlePlaylistLikeToggleEvent(playlist.id))
  }

  public openEditorDialog(options: AscPlaylistEditorOptions = new AscPlaylistEditorOptions()) {
    return this.dialogService.open(AscPlaylistEditorDialogComponent, {
      data: options
    })
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

  public async addSongs(playlistId: string, songs: Song[]): Promise<Playlist> {
    return firstValueFrom(this.httpClient.put<Playlist>(`${environment.api_base_uri}/v1/playlists/${playlistId}/songs/add`, songs.map((song) => song?.id))).then((playlist) => {
      this._onSongsAddedSubject.next({ songs, playlistId })
      this.snackbarService.info("Songs zur Playlist hinzugefügt.")
      this.updatePlaylistLocally(playlist)
      return playlist;
    }).catch((error: HttpErrorResponse) => {
      if(error.status == 409) {
        this.snackbarService.open("Dieser Song existiert bereits in der Playlist.", null, { duration: 4000 })
      } else {
        this.snackbarService.open("Song konnte nicht zur Playlist hinzugefügt werden.", null, { duration: 4000 })
      }
      return null;
    })
  }

  public async removeSongs(playlistId: string, songs: Song[]): Promise<Playlist> {
    return firstValueFrom(this.httpClient.put<Playlist>(`${environment.api_base_uri}/v1/playlists/${playlistId}/songs/remove`, songs.map((song) => song?.id))).then((playlist) => {
      this._onSongsRemovedSubject.next({ songs, playlistId })
      this.snackbarService.info("Songs aus Playlist entfernt.")
      this.updatePlaylistLocally(playlist)
      return playlist;
    }).catch((error: Error) => {
      this.snackbarService.error(`Song konnte nicht aus der Playlist entfernt werden: ${error.message}`)
      return null;
    })
  }

  public async addCollaborators(playlistId: string, collaboratorIds: string[]): Promise<void> {
    return firstValueFrom(this.httpClient.put<void>(`${environment.api_base_uri}/v1/playlists/${playlistId}/collaborators/add`, collaboratorIds))
  }

  public async removeCollaborators(playlistId: string, collaboratorIds: string[]): Promise<void> {
    return firstValueFrom(this.httpClient.put<void>(`${environment.api_base_uri}/v1/playlists/${playlistId}/collaborators/remove`, collaboratorIds))
  }

  public async create(createPlaylistDto: CreatePlaylistDTO): Promise<Playlist> {
    return (firstValueFrom(this.httpClient.post<Playlist>(`${environment.api_base_uri}/v1/playlists`, createPlaylistDto))).then((playlist) => {
      const playlists = this._playlistsSubject.getValue();
      if(playlists.findIndex((p) => p.id == playlist.id) == -1) playlists.push(playlist);
      return playlist;
    })
  }

  public async update(playlistId: string, updatePlaylistDto: UpdatePlaylistDTO): Promise<void> {
    if(!playlistId) return;
    return (firstValueFrom(this.httpClient.put<void>(`${environment.api_base_uri}/v1/playlists/${playlistId}`, updatePlaylistDto))).then(() => {
      const playlists = this._playlistsSubject.getValue();
      const playlist = playlists.find((pl) => pl?.id == playlistId)
      if(!playlist) return;

      // Update data locally after it was updated in backend
      playlist.title = updatePlaylistDto.title || playlist.title;
      playlist.privacy = updatePlaylistDto.privacy || playlist.privacy;

      // TODO: Send event
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
        if(playlist.liked) {
          // The data is outdated, so in this case the playlist isn't liked anymore.
          this.authService.$user.pipe(take(1)).subscribe((user) => {
            if(playlist.author?.id != user?.id) {
              this._playlistsSubject.next(this._playlistsSubject.getValue().filter((p) => p.id != playlist.id))
            }
          })
        }
      }
  }

  private async updatePlaylistLocally(playlist: Playlist) {
    const playlists = this._playlistsSubject.getValue();
    const index = playlists.findIndex((p) => p.id == playlist.id);

    if(index == -1) return;
    playlists[index] = playlist;
    this._playlistsSubject.next(playlists);
  }

}
