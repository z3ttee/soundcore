import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, of, Subject, switchMap } from 'rxjs';
import { Artist, Future, SCDKArtistService, SCSDKDatasource, SCSDKSongService, SCSDKTracklistV2Service, Song, toFutureCompat, TracklistV2 } from '@soundcore/sdk';
import { AUDIOWAVE_LOTTIE_OPTIONS } from 'src/app/constants';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { SCNGXTracklist } from 'src/app/modules/player/entities/tracklist.entity';
import { PlayerService } from 'src/app/modules/player/services/player.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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
    // Load tracklist
    this.$artist.pipe(switchMap((artist): Observable<Future<SCNGXTracklist<Song>>> => {
      // If album still loading, return future with state loading
      if(artist.loading) return of(Future.loading());
      // Fetch tracklist by album
      return this.tracklistService.findByArtist(artist.data?.id).pipe(
        map((tracklist): Future<SCNGXTracklist<Song>> => {
          // If tracklist entity still loading, return loading state
          if(tracklist.loading) return Future.loading();
          // Otherwise build tracklist instance
          return Future.of(new SCNGXTracklist(tracklist.data, `${environment.api_base_uri}`, this.httpClient))
        })
      );
    }))
    // this.player.$current.pipe(takeUntil(this._destroy)),
    // this.player.$isPaused.pipe(takeUntil(this._destroy))
  ]).pipe(
    // Build props object
    map(([artist, tracklist]): ArtistSongsProps => ({
      artist: artist,
      // currentlyPlaying: currentItem,
      // playing: !isPaused && currentItem?.tracklist?.id == future.data?.id,
      tracklist: tracklist.data
    })),
  );

  // Lottie animations options
  public animOptions = AUDIOWAVE_LOTTIE_OPTIONS;

  public ngOnInit(): void {}

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public forcePlay(artist: Artist, tracklist: SCNGXTracklist) {
    console.log(tracklist);
    this.playerService.forcePlay(artist, tracklist).subscribe();
  }

  public forcePlayAt(artist: Artist, tracklist: SCNGXTracklist, indexAt: number) {
    this.playerService.forcePlayAt(artist, tracklist, indexAt).subscribe();
  }

}
