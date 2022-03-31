import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Song } from 'src/app/features/song/entities/song.entity';
import { Artist } from 'src/app/features/artist/entities/artist.entity';
import { ArtistService } from '../../services/artist.service';
import { Album } from 'src/app/features/album/entities/album.entity';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { Genre } from 'src/app/model/genre.entity';
import { Page } from 'src/app/pagination/pagination';
import { BehaviorSubject, combineLatest, firstValueFrom, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { GenreService } from 'src/app/features/genre/services/genre.service';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { ListCreator } from 'src/lib/data/list-creator';
import { PlayableList } from 'src/lib/data/playable-list.entity';
import { SCLoadingState } from 'src/lib/states/loading-state';
import { AlbumService } from 'src/app/features/album/services/album.service';
import { SongService } from 'src/app/features/song/services/song.service';

@Component({
  selector: 'asc-artist-info',
  templateUrl: './artist-info.component.html',
  styleUrls: ['./artist-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistInfoComponent implements OnInit, OnDestroy {

  constructor(
    private activatedRoute: ActivatedRoute,
    private songService: SongService,
    private albumService: AlbumService,
    private genreService: GenreService,
    private artistService: ArtistService,
    private audioService: AudioService,
    private listCreator: ListCreator,
    public router: Router
  ) { }

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Loading states
  public artistLoadingState: SCLoadingState = new SCLoadingState(true);
  public genreLoadingState: SCLoadingState = new SCLoadingState(true);
  public songLoadingState: SCLoadingState = new SCLoadingState(true);
  public topSongLoadingState: SCLoadingState = new SCLoadingState(true);
  public albumLoadingState: SCLoadingState = new SCLoadingState(true);
  public featAlbumLoadingState: SCLoadingState = new SCLoadingState(true);
  public featPlaylistLoadingState: SCLoadingState = new SCLoadingState(true);

  // Data providers
  private _artistSubject: BehaviorSubject<Artist> = new BehaviorSubject(null);
  private _topSongsSubject: BehaviorSubject<Song[]> = new BehaviorSubject([]);
  private _songsSubject: BehaviorSubject<Page<Song>> = new BehaviorSubject(Page.of([]));
  private _albumsSubject: BehaviorSubject<Page<Album>> = new BehaviorSubject(Page.of([]));
  private _featAlbumsSubject: BehaviorSubject<Page<Album>> = new BehaviorSubject(Page.of([]));
  private _featPlaylistsSubject: BehaviorSubject<Playlist[]> = new BehaviorSubject([]);
  private _genresSubject: BehaviorSubject<Page<Genre>> = new BehaviorSubject(null);

  public $artist: Observable<Artist> = this._artistSubject.asObservable();
  public $topSongs: Observable<Song[]> = this._topSongsSubject.asObservable();
  public $songs: Observable<Page<Song>> = this._songsSubject.asObservable();
  public $albums: Observable<Page<Album>> = this._albumsSubject.asObservable();
  public $featAlbums: Observable<Page<Album>> = this._featAlbumsSubject.asObservable();
  public $featPlaylists: Observable<Playlist[]> = this._featPlaylistsSubject.asObservable();
  public $genres: Observable<Page<Genre>> = this._genresSubject.asObservable();

  private artistId: string;

  public list: PlayableList<Artist>;
  public $isArtistPaused: Observable<boolean> = combineLatest([ this.audioService.$paused, this.audioService.$currentItem ]).pipe(
    takeUntil(this.$destroy),
    map(([paused, item]) => paused || item?.context?.id != this.list?.id)
  )

  public ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      this.artistId = paramMap.get("artistId");

      this.findProfile().then((artist) => {
        this.list = this.listCreator.forTopArtistSongs(artist);
      });

      this.findSongs();
      this.findGenres();
      this.findAlbums();
      this.findFeaturedAlbums();
    })
  }

  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

  /**
   * Find profile of an artist.
   * This will update the loading
   * state automatically.
   * @returns Page<Artist>
   */
  public async findProfile(): Promise<Artist> {
    this.artistLoadingState.set(true)
    return this.artistService.findProfileById(this.artistId).then((artist) => {
      this._artistSubject.next(artist);
      return artist;
    }).catch((error: Error) => {
      this._artistSubject.next(null);
      this.artistLoadingState.setError(error);
      console.error(error);
      return null;
    }).finally(() => this.artistLoadingState.set(false))
  }

  /**
   * Find songs of an artist.
   * This will fetch the first 30 songs and update the loading
   * state automatically.
   * @returns Page<Album>
   */
   public async findSongs(): Promise<Page<Album>> {
    this.songLoadingState.set(true)
    return this.songService.findByArtist(this.artistId, { size: 12, page: 0 }).then((page) => {
      this._songsSubject.next(page);
      return page;
    }).catch((error: Error) => {
      this._songsSubject.next(Page.of([]));
      this.songLoadingState.setError(error);
      return Page.of([]);
    }).finally(() => this.songLoadingState.set(false))
  }

  /**
   * Find genres of an artist.
   * This will fetch the first 12 genres and update the loading
   * state automatically.
   * @returns Page<Genre>
   */
  public async findGenres(): Promise<Page<Genre>> {
    this.genreLoadingState.set(true)
    return this.genreService.findGenresByArtist(this.artistId, { size: 12, page: 0 }).then((page) => {
      this._genresSubject.next(page);
      return page;
    }).catch((error: Error) => {
      this._genresSubject.next(Page.of([]));
      this.genreLoadingState.setError(error);
      return Page.of([]);
    }).finally(() => this.genreLoadingState.set(false))
  }

  /**
   * Find albums of an artist.
   * This will fetch the first 12 albums and update the loading
   * state automatically.
   * @returns Page<Album>
   */
  public async findAlbums(): Promise<Page<Album>> {
    this.albumLoadingState.set(true)
    return this.albumService.findAlbumsByArtist(this.artistId, { size: 12, page: 0 }).then((page) => {
      this._albumsSubject.next(page);
      return page;
    }).catch((error: Error) => {
      this._albumsSubject.next(Page.of([]));
      this.albumLoadingState.setError(error);
      return Page.of([]);
    }).finally(() => this.albumLoadingState.set(false))
  }

  /**
   * Find albums featuring an artist.
   * This will fetch the first 12 albums and update the loading
   * state automatically.
   * @returns Page<Album>
   */
   public async findFeaturedAlbums(): Promise<Page<Album>> {
    this.featAlbumLoadingState.set(true)
    return this.albumService.findFeaturedAlbumsWithArtist(this.artistId, { size: 12, page: 0 }).then((page) => {
      this._featAlbumsSubject.next(page);
      return page;
    }).catch((error: Error) => {
      this._featAlbumsSubject.next(Page.of([]));
      this.featAlbumLoadingState.setError(error);
      return Page.of([]);
    }).finally(() => this.featAlbumLoadingState.set(false))
  }

  public async playOrPauseTopSongs() {
    this.audioService.playOrPauseList(this.list)
  }

  public async onMoreSongs() {
    firstValueFrom(this.$artist).then((artist) => {
      if(!artist) return
      this.router.navigate(['/artist', artist?.id, 'songs'])
    })
  }

  public async onMoreAlbums() {
    firstValueFrom(this.$artist).then((artist) => {
      if(!artist) return
      this.router.navigate(['/artist', artist?.id, 'albums'])
    })
  }

  public async onMoreFeaturedAlbums() {
    firstValueFrom(this.$artist).then((artist) => {
      if(!artist) return
      this.router.navigate(['/artist', artist?.id, 'featuring'])
    })
  }

}
