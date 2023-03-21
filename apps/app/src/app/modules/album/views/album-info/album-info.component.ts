import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Album, ApiError, Future, Page, SCDKAlbumService, toFutureCompat } from '@soundcore/sdk';
import { SCNGXTracklist, SCNGXTracklistBuilder } from '@soundcore/ngx';
import { AUDIOWAVE_LOTTIE_OPTIONS } from 'src/app/constants';

interface AlbumInfoProps {
  album?: Album;
  loading?: boolean;
  error?: ApiError;

  tracklist?: SCNGXTracklist;
  currentlyPlaying?: any;

  featuredAlbums?: Album[];

  playing?: boolean;
}

@Component({
  templateUrl: './album-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumInfoComponent implements OnInit, OnDestroy {

  constructor(
    private readonly albumService: SCDKAlbumService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly tracklistBuilder: SCNGXTracklistBuilder,
    // private readonly player: AppPlayerService
  ) { }

  private readonly _destroy: Subject<void> = new Subject();

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
    this.$album.pipe(
      // Build a new tracklist for album data
      map((albumFuture): Future<SCNGXTracklist<Album>> => ({
        loading: albumFuture.loading,
        error: albumFuture.error,
        data: this.tracklistBuilder.forAlbum(albumFuture.data)
      })),
      // Request recommended albums for artist.
      switchMap((tracklistFuture) => {
        // If album still loading
        if(tracklistFuture.loading) return of([tracklistFuture, { loading: true }] as [Future<SCNGXTracklist>, Future<Page<Album>>]);
        const album = tracklistFuture.data?.context;

        return this.albumService.findRecommendedByArtist(album?.primaryArtist?.id, [ album?.id ]).pipe(
          toFutureCompat(),
          map((featAlbumsRequest): [Future<SCNGXTracklist>, Future<Page<Album>>] => ([ tracklistFuture, featAlbumsRequest ])),
        );
      }),
      // Map future
      map(([tracklistFuture, featuredAlbumFuture]): Future<[SCNGXTracklist, Page<Album>]> => ({
        loading: tracklistFuture.loading,
        error: tracklistFuture.error ?? featuredAlbumFuture.error,
        data: [
          tracklistFuture.data,
          featuredAlbumFuture?.data as Page<Album>
        ]
      }))
    ),
    // this.player.$current.pipe(takeUntil(this._destroy)),
    // this.player.$isPaused.pipe(takeUntil(this._destroy))
  ]).pipe(
    // Build props object
    map(([future]): AlbumInfoProps => {
      const tracklist = future.data[0];
      const albums = future.data?.[1];

      return {
        loading: future.loading,
        album: tracklist?.context,
        // currentlyPlaying: currentItem,
        // playing: !isPaused && currentItem?.tracklist?.id == tracklist?.id,
        tracklist: tracklist,
        featuredAlbums: albums?.elements
      };
    }),
  );

  public ngOnInit(): void {
    
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public forcePlay(tracklist: SCNGXTracklist) {
    // this.player.playTracklist(tracklist, true).subscribe();
  }

}
