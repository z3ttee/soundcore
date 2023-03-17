import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { MeiliPlaylist } from '../../meilisearch/entities/meili-playlist.entity';
import { ApiSearchResponse } from '../../meilisearch/entities/search-response.entity';
<<<<<<< HEAD
import { SCSDKOptions, SCSDK_OPTIONS } from '../../scdk.module';
=======
import { SCSDKOptions } from '../../scdk.module';
>>>>>>> main
import { ApiResponse } from '../../utils/responses/api-response';
import { apiResponse } from '../../utils/rxjs/operators/api-response';
import { AddSongDTO } from '../dtos/add-song.dto';
import { CreatePlaylistDTO } from '../dtos/create-playlist.dto';
import { PlaylistItemAddResult } from '../entities/playlist-item-added.entity';
import { Playlist } from '../entities/playlist.entity';
import { Page, Pageable } from "../../pagination";
import { Logger } from '../../logging';
import { Future } from '../../utils/future/future';
import { toFuture } from '../../utils/future';
import { SCSDK_OPTIONS } from '../../constants';

@Injectable()
export class SCSDKPlaylistService {
  private readonly logger = new Logger("PlaylistService");

  /**
   * Subject used to control the emitted data by the $library observable.
   */
  private readonly _librarySubj: BehaviorSubject<Playlist[]> = new BehaviorSubject([]);

  /**
   * Observable that emits the currently available playlists of a user.
   */
  public readonly $library: Observable<Playlist[]> = this._librarySubj.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
  ) {
    this.fetchPlaylistLibrary();
  }

  /**
   * Find a playlist by its id.
   * @param playlistId Playlist's id
   * @returns Playlist
   */
  public findById(playlistId: string): Observable<ApiResponse<Playlist>> {
    if(!playlistId) return of(ApiResponse.withPayload(null));
    return this.httpClient.get<Playlist>(`${this.options.api_base_uri}/v1/playlists/${playlistId}`).pipe(apiResponse());
  }

  /**
   * Find playlists featuring an artist.
   * @param artistId Artist's id
   * @param pageable Page settings
   * @returns Future<Page<Playlist>>
   */
  public findByArtist(artistId: string, pageable: Pageable): Observable<Future<Page<Playlist>>> {
    if(!artistId) return of(Future.notfound());
    return this.httpClient.get<Page<Playlist>>(`${this.options.api_base_uri}/v1/playlists/byArtist/${artistId}${pageable.toQuery()}`).pipe(toFuture());
  }

  /**
   * Find playlists by its author.
   * @param authorId Playlist author's id
   * @returns Playlist
   */
   public findByAuthor(authorId: string, pageable: Pageable): Observable<ApiResponse<Page<Playlist>>> {
    if(!authorId) return of(ApiResponse.withPayload(null));
    return this.httpClient.get<Page<Playlist>>(`${this.options.api_base_uri}/v1/playlists/byAuthor/${authorId}${pageable.toQuery()}`).pipe(apiResponse());
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
    return this.httpClient.put<PlaylistItemAddResult>(`${this.options.api_base_uri}/v1/playlists/${playlistId}/addSong`, addSongDto).pipe(apiResponse());
  }

  /**
   * Fetch the playlist library
   * of the currently logged in user.
   */
  private fetchPlaylistLibrary() {
    this.logger.log(`Fetching playlist library of current user...`);

    this.httpClient.get<Page<Playlist>>(`${this.options.api_base_uri}/v1/playlists/@me`).pipe(apiResponse()).subscribe((response) => {
      if(response.error) {
        this.logger.error(`Could not fetch playlist library of current user: ${response.message}`, response.error);
        return;
      }

      const elements = response.payload.elements;
      this._librarySubj.next(elements);

      this.logger.log(`Found ${elements.length} playlists in current user's library.`);
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

    this.logger.log(`Added playlist '${playlist.name}' to local library.`);
  }

}
