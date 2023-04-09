import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, of, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { Album, Future, SCDKAlbumService, SCSDKDatasource, SCSDKSongService, Song, toFutureCompat } from '@soundcore/sdk';
import { AUDIOWAVE_LOTTIE_OPTIONS } from 'src/app/constants';
import { PlayerService } from 'src/app/modules/player/services/player.service';
import { SCNGXTracklist } from 'src/app/modules/player/entities/tracklist.entity';
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
export class AlbumInfoComponent implements OnDestroy {

  private readonly $destroy: Subject<void> = new Subject();

  constructor(
    private readonly albumService: SCDKAlbumService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly playerService: PlayerService,
    private readonly songService: SCSDKSongService,
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

  /**
   * Observable that emits current datasource
   * of tracks
   */
  public $datasource: Observable<SCSDKDatasource<Song>> = this.$albumId.pipe(switchMap((albumId) => this.songService.findByAlbumDatasource(albumId)));

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
  ]).pipe(
    // Build props object
    map(([album, isPaused, currentItem]): AlbumInfoProps => {
      const currentTracklistId = currentItem?.tracklistId;
      const currentItemId = currentItem?.id;

      return {
        album: album,
        isPlaying: !isPaused && currentTracklistId === album.data?.id,
        isTracklistActive: currentTracklistId === album.data?.id,
        currentItemId: currentItemId
      };
    }),
    takeUntil(this.$destroy)
  );

  public ngOnDestroy(): void {
      this.$destroy.next();
      this.$destroy.complete();
  }

  public forcePlay(album: Album) {
    this.playerService.forcePlay(album).subscribe();
  }

  public forcePlayAt(album: Album, indexAt: number, itemId: string) {
    this.playerService.forcePlayAt(album, indexAt, itemId).subscribe();
  }

}
