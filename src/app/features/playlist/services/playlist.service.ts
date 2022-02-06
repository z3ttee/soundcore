import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Page, Pageable } from 'src/app/pagination/pagination';
import { environment } from 'src/environments/environment';
import { Song } from '../../song/entities/song.entity';
import { CreatePlaylistDTO } from '../dtos/create-playlist.dto';
import { Playlist } from '../entities/playlist.entity';

const PLAYLIST_STORAGE_KEY = "asc_user_playlists"

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  private _playlistsSubject: BehaviorSubject<Playlist[]> = new BehaviorSubject([]);
  public $playlists: Observable<Playlist[]> = this._playlistsSubject.asObservable();

  constructor(private httpClient: HttpClient) { 
    this.restoreAndFindPlaylists().then((playlists) => {
      this._playlistsSubject.next(playlists)
      this.$playlists.subscribe((playlists) => this.handlePlaylistsUpdateEvent(playlists))
    })
  }

  public async findById(playlistId: string): Promise<Playlist> {
    return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/playlists/${playlistId}`)) as Promise<Playlist>
  }

  public async findSongsByPlaylist(playlistId: string, pageable: Pageable): Promise<Page<Song>> {
    return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/playlists/songs/${playlistId}${Pageable.toQuery(pageable)}`)) as Promise<Page<Song>>
  }

  public async findPageByAuthor(authorId: string = "@me"): Promise<Page<Playlist>> {
    return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/playlists/byAuthor/${authorId}`)) as Promise<Page<Playlist>>
  }

  public async addSongs(playlistId: string, songIds: string[]): Promise<void> {
    return firstValueFrom(this.httpClient.put<void>(`${environment.api_base_uri}/v1/playlists/${playlistId}/songs/add`, songIds))
  }

  public async removeSongs(playlistId: string, songIds: string[]): Promise<void> {
    return firstValueFrom(this.httpClient.put<void>(`${environment.api_base_uri}/v1/playlists/${playlistId}/songs/remove`, songIds))
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
    return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/playlists/byAuthor/@me`)) as Promise<Page<Playlist>>
  }

  private async handlePlaylistsUpdateEvent(playlists: Playlist[]): Promise<void> {
    // TODO: Properly save playlists for caching to localStorage or maybe IndexedDB?
  }

}
