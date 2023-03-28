import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, filter, map, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { Album, ApiError, Future, Page, SCDKAlbumService, SCSDKDatasource, SCSDKSongService, SCSDKTracklistV2Service, Song, toFutureCompat } from '@soundcore/sdk';
import { AUDIOWAVE_LOTTIE_OPTIONS } from 'src/app/constants';
import { PlayerService } from 'src/app/modules/player/services/player.service';
import { SCNGXTracklist } from 'src/app/modules/player/entities/tracklist.entity';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

interface AlbumInfoProps {
  album?: Album;
  loading?: boolean;
  error?: ApiError;

  currentlyPlaying?: any;

  tracklist?: Future<SCNGXTracklist<Song>>;
  datasource?: Future<SCSDKDatasource<Song>>;
  recommendedAlbums?: Future<Page<Album>>;

  playing?: boolean;
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
   * Observable that emits current
   * album data in future format
   */
  public $album: Observable<Future<Album>> = this.$albumId.pipe(switchMap((albumId) => this.albumService.findById(albumId).pipe(toFutureCompat())));

  public readonly $props: Observable<AlbumInfoProps> = combineLatest([
    // Get changes to album
    this.$album,
    // Load recommended albums by artist
    this.$album.pipe(
      switchMap((album) => {
        // If album still loading, return future with state loading
        if(album.loading) return of(Future.loading());

        const data = album.data;
        return this.albumService.findRecommendedByArtist(data?.primaryArtist?.id, [ data?.id ]).pipe(toFutureCompat(),);
      })
    ),
    // Load datasource
    this.$album.pipe(
      switchMap((album): Observable<Future<SCSDKDatasource<Song>>> => {
        // If album still loading, return future with state loading
        if(album.loading) return of(Future.loading());
        // Init datasource
        return this.songService.findByAlbumDatasource(album.data?.id).pipe(map((datasource) => Future.of(datasource)));
      })
    ),
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
    )
    // this.player.$current.pipe(takeUntil(this._destroy)),
    // this.player.$isPaused.pipe(takeUntil(this._destroy))
  ]).pipe(
    // Build props object
    map(([album, recommendedAlbums, datasource, tracklist]): AlbumInfoProps => {
      // const tracklist = future.data[0];
      // const albums = future.data?.[1];

      return {
        loading: album.loading,
        album: album.data,
        tracklist: tracklist,
        datasource: datasource,
        // currentlyPlaying: currentItem,
        // playing: !isPaused && currentItem?.tracklist?.id == tracklist?.id,
        // tracklist: tracklist,
        recommendedAlbums: recommendedAlbums
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
