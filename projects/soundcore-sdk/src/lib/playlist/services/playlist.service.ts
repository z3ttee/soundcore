import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { MeiliPlaylist } from '../../meilisearch/entities/meili-playlist.entity';
import { ApiSearchResponse } from '../../meilisearch/entities/search-response.entity';
import { SCDKOptions, SCDK_OPTIONS } from '../../scdk.module';
import { Page } from '../../utils/page/page';
import { Pageable } from '../../utils/page/pageable';
import { ApiResponse } from '../../utils/responses/api-response';
import { apiResponse } from '../../utils/rxjs/operators/api-response';
import { AddSongDTO } from '../dtos/add-song.dto';
import { CreatePlaylistDTO } from '../dtos/create-playlist.dto';
import { PlaylistItemAddResult } from '../entities/playlist-item-added.entity';
import { Playlist } from '../entities/playlist.entity';

@Injectable({
  providedIn: "root"
})
export class SCDKPlaylistService {
  private readonly _librarySubj: BehaviorSubject<Playlist[]> = new BehaviorSubject([]);

  public $library: Observable<Playlist[]> = this._librarySubj.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
  ) {
    this.fetchPlaylistLibrary();
  }

  /**
   * Search playlists by a given query.
   * @param {string} query Search query
   * @param {Pageable} pageable Page settings
   * @returns {ApiResponse<ApiSearchResponse<MeiliPlaylist>>} ApiResponse<ApiSearchResponse<MeiliPlaylist>>
   */
  public searchPlaylist(query: string, pageable: Pageable): Observable<ApiResponse<ApiSearchResponse<MeiliPlaylist>>> {
    return this.httpClient.get<ApiSearchResponse<MeiliPlaylist>>(`${this.options.api_base_uri}/v1/search/playlists/?q=${query}&${pageable.toParams()}`).pipe(apiResponse());
  }

  /**
   * Create a new playlist. On success, the returned playlist object
   * will automatically be added to the local library of the user.
   * This makes sense so that the application can display the playlist for example
   * in the sidebar.
   * @param createPlaylistDto Playlist data to create
   * @returns Playlist
   */
  public createPlaylist(createPlaylistDto: CreatePlaylistDTO): Observable<ApiResponse<Playlist>> {
    return this.httpClient.post<Playlist>(`${this.options.api_base_uri}/v1/playlists`, createPlaylistDto).pipe(
      apiResponse(),
      tap((response) => this.addToLocalLibrary(response.payload))
    );
  }

  /**
   * Add a song to a playlist
   * @param playlistId Playlist's id
   * @param addSongDto Body data
   * @returns PlaylistItemAddResult
   */
  public addSongToPlaylist(playlistId: string, addSongDto: AddSongDTO): Observable<ApiResponse<PlaylistItemAddResult>> {
    return this.httpClient.put<PlaylistItemAddResult>(`${this.options.api_base_uri}/v1/playlists/${playlistId}/addSong`, addSongDto).pipe(
      apiResponse(),
      tap((response) => {
        if(response.error) return;
        // TODO: Create observable on which a notification will be pushed that the song has been added.
      })
    );
  }

  /**
   * Fetch the playlist library
   * of the currently logged in user.
   */
  private fetchPlaylistLibrary() {
    console.log(`[${SCDKPlaylistService.name}] Fetching playlist library of user.`);

    this.httpClient.get<Page<Playlist>>(`${this.options.api_base_uri}/v1/playlists/@me`).pipe(apiResponse()).subscribe((response) => {
      if(response.error) {
        console.error(`[${SCDKPlaylistService.name}] Could not fetch playlist library of current user: ${response.message}`, response.error);
        return
      }

      const elements = response.payload.elements;
      this._librarySubj.next(elements);
      console.log(`[${SCDKPlaylistService.name}] Found ${elements.length} playlists in current user's library.`);
    });
  }

  /**
   * Add a playlist to the local library
   * so the application can show it everywhere it
   * is needed in overviews etc.
   * @param playlist Playlist to add
   */
  private addToLocalLibrary(playlist: Playlist) {
    if(typeof playlist === "undefined" || playlist == null) return;
    const playlists = this._librarySubj.getValue();
    playlists.push(playlist)
    this._librarySubj.next(playlists);
    console.log(`[${SCDKPlaylistService.name}] Added playlist '${playlist.name}' to local library.`);
  }

}
