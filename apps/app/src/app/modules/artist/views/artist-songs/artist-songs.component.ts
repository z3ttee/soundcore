import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { Artist, SCDKArtistService, toFutureCompat } from '@soundcore/sdk';
import { AUDIOWAVE_LOTTIE_OPTIONS } from 'src/app/constants';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { SCNGXTracklist, SCNGXTracklistBuilder } from '@soundcore/ngx';

interface ArtistSongsProps {
  artist?: Artist;
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
    private readonly tracklistBuilder: SCNGXTracklistBuilder,
    // private readonly player: AppPlayerService
  ) { }

  private readonly _destroy: Subject<void> = new Subject();

  public readonly $props: Observable<ArtistSongsProps> = combineLatest([
    this.activatedRoute.paramMap.pipe(
      takeUntil(this._destroy), 
      // Get artist id from route
      map((params) => params.get("artistId") ?? null), 
      // Switch to request observable
      switchMap((artistId) => this.artistService.findById(artistId).pipe(toFutureCompat())), 
      // Map future
      map((future) => ({
        ...future,
        data: this.tracklistBuilder.forArtist(future.data)
      }))
    ),
    // this.player.$current.pipe(takeUntil(this._destroy)),
    // this.player.$isPaused.pipe(takeUntil(this._destroy))
  ]).pipe(
    // Build props object
    map(([future]): ArtistSongsProps => ({
      loading: future.loading,
      artist: future.data?.context,
      // currentlyPlaying: currentItem,
      // playing: !isPaused && currentItem?.tracklist?.id == future.data?.id,
      tracklist: future.data
    })),
  );

  // Lottie animations options
  public animOptions = AUDIOWAVE_LOTTIE_OPTIONS;

  public ngOnInit(): void {}

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public forcePlay(tracklist: SCNGXTracklist) {
    // this.player.playTracklist(tracklist, true).subscribe();
  }

  public forcePlayAtSong(tracklist: SCNGXTracklist, playAtIndex: number) {
    // this.player.playTracklist(tracklist, true, playAtIndex).subscribe();
  }

}
