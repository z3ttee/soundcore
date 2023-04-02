import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, Subject, switchMap } from 'rxjs';
import { Artist, Future, SCDKArtistService, SCSDKDatasource, SCSDKSongService, SCSDKTracklistV2Service, Song, toFutureCompat } from '@soundcore/sdk';
import { AUDIOWAVE_LOTTIE_OPTIONS } from 'src/app/constants';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { SCNGXTracklist } from 'src/app/modules/player/entities/tracklist.entity';
import { PlayerService } from 'src/app/modules/player/services/player.service';
import { HttpClient } from '@angular/common/http';

interface ArtistSongsProps {
  artist?: Future<Artist>;
  tracklist?: SCNGXTracklist;
  currentlyPlaying?: any;

  playing?: boolean;
  loading?: boolean;
}

@Component({
  templateUrl: './artist-songs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistSongsComponent implements OnInit, OnDestroy {

  @ViewChild("scroller") public readonly scroller: CdkVirtualScrollViewport;

  constructor(
    private readonly artistService: SCDKArtistService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly playerService: PlayerService,
    private readonly songService: SCSDKSongService,
    private readonly tracklistService: SCSDKTracklistV2Service,
    private readonly httpClient: HttpClient
  ) { }

  private readonly _destroy: Subject<void> = new Subject();

  private $artistId: Observable<string> = this.activatedRoute.paramMap.pipe(map((params) => params.get("artistId") ?? null))

  public $artist: Observable<Future<Artist>> = this.$artistId.pipe(switchMap((artistId) => this.artistService.findById(artistId).pipe(toFutureCompat())));
  public $datasource: Observable<SCSDKDatasource<Song>> = this.$artistId.pipe(switchMap((artistId) => this.songService.findByArtistDatasource(artistId)))

  public readonly $props: Observable<ArtistSongsProps> = combineLatest([
    this.$artist,
    // this.player.$current.pipe(takeUntil(this._destroy)),
    // this.player.$isPaused.pipe(takeUntil(this._destroy))
  ]).pipe(
    // Build props object
    map(([artist]): ArtistSongsProps => ({
      artist: artist,
      // currentlyPlaying: currentItem,
      // playing: !isPaused && currentItem?.tracklist?.id == future.data?.id,
    })),
  );

  // Lottie animations options
  public animOptions = AUDIOWAVE_LOTTIE_OPTIONS;

  public ngOnInit(): void {}

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public forcePlay(artist: Artist) {
    this.playerService.forcePlay(artist).subscribe();
  }

  public forcePlayAt(artist: Artist, indexAt: number) {
    this.playerService.forcePlayAt(artist, indexAt).subscribe();
  }

}
