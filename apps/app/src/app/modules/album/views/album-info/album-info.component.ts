import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, of, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { Album, Future, SCDKAlbumService, SCSDKDatasource, SCSDKSongService, SCSDKTracklistV2Service, Song, toFutureCompat } from '@soundcore/sdk';
import { AUDIOWAVE_LOTTIE_OPTIONS } from 'src/app/constants';
import { PlayerService } from 'src/app/modules/player/services/player.service';
import { SCNGXTracklist } from 'src/app/modules/player/entities/tracklist.entity';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Page } from '@soundcore/common';

interface AlbumInfoProps {
  album?: Future<Album>;
  tracklist?: Future<SCNGXTracklist<Song>>;
  recommendedAlbums?: Future<Page<Album>>;
  isPlaying?: boolean;
  isTracklistActive?: boolean;
  currentItemId?: string;
}

@Component({
  templateUrl: './album-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumInfoComponent implements OnInit, OnDestroy {

  private readonly $destroy: Subject<void> = new Subject();

  constructor(
    private readonly albumService: SCDKAlbumService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly playerService: PlayerService,
    private readonly songService: SCSDKSongService,
    private readonly tracklistService: SCSDKTracklistV2Service,
    private readonly httpClient: HttpClient,
  ) { }

  // Lottie animations options
  public animOptions = AUDIOWAVE_LOTTIE_OPTIONS;

  /**
   * Observable that emits currently active
   * albumId extracted from the url.
   */
  public $albumId: Observable<string> = this.activatedRoute.paramMap.pipe(map((params) => params.get("albumId")));

  /**
   * Observable that emits current datasource
   * of tracks
   */
  public $datasource: Observable<SCSDKDatasource<Song>> = this.$albumId.pipe(switchMap((albumId) => {
    return this.songService.findByAlbumDatasource(albumId);
  }))

  /**
   * Observable that emits current
   * album data in future format
   */
  public $album: Observable<Future<Album>> = this.$albumId.pipe(switchMap((albumId) => this.albumService.findById(albumId).pipe(toFutureCompat())));

  /**
   * Observable that emits recommended albums
   */
  public $recommendedAlbums: Observable<Future<Page<Album>>> = this.$album.pipe(switchMap((album) => {
    if(album.loading) return of(Future.loading());
    return this.albumService.findRecommendedByArtist(album.data?.primaryArtist?.id, [ album.data?.id ]).pipe(toFutureCompat(),);
  }))

  public readonly $props: Observable<AlbumInfoProps> = combineLatest([
    // Get changes to album
    this.$album,
    // Get paused state
    this.playerService.$isPaused.pipe(startWith(true)), 
    // Get current tracklist id
    this.playerService.$currentItem.pipe(startWith(null)),
    // Load tracklist
    this.$album.pipe(
      switchMap((album): Observable<Future<SCNGXTracklist<Song>>> => {
        // If album still loading, return future with state loading
        if(album.loading) return of(Future.loading());
        // Fetch tracklist by album
        return this.tracklistService.findByAlbum(album.data?.id).pipe(
          map((tracklist): Future<SCNGXTracklist<Song>> => {
            // If tracklist entity still loading, return loading state
            if(tracklist.loading) return Future.loading();
            // Otherwise build tracklist instance
            return Future.of(new SCNGXTracklist(tracklist.data, `${environment.api_base_uri}`, this.httpClient))
          })
        );
      })
    ),
  ]).pipe(
    // Build props object
    map(([album, isPaused, currentItem, tracklist]): AlbumInfoProps => {
      const currentTracklistId = currentItem?.tracklistId;
      const currentItemId = currentItem?.id;

      return {
        album: album,
        tracklist: tracklist,
        isPlaying: !isPaused && currentTracklistId === tracklist.data?.id,
        isTracklistActive: currentTracklistId === tracklist.data?.id,
        currentItemId: currentItemId
      };
    }),
    takeUntil(this.$destroy)
  );

  public ngOnInit(): void {
    
  }

  public ngOnDestroy(): void {
      this.$destroy.next();
      this.$destroy.complete();
  }

  public forcePlay(album: Album, tracklist: SCNGXTracklist) {
    this.playerService.forcePlay(album, tracklist).subscribe();
  }

  public forcePlayAt(album: Album, tracklist: SCNGXTracklist, indexAt: number) {
    this.playerService.forcePlayAt(album, tracklist, indexAt).subscribe();
  }

}
