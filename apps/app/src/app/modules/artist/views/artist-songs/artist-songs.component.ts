import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, startWith, Subject, switchMap } from 'rxjs';
import { Artist, Future, SCDKArtistService, SCSDKDatasource, SCSDKSongService, Song, toFutureCompat } from '@soundcore/sdk';
import { AUDIOWAVE_LOTTIE_OPTIONS } from 'src/app/constants';
import { PlayerService } from 'src/app/modules/player/services/player.service';

interface ArtistSongsProps {
  artist?: Future<Artist>;
  isPlaying?: boolean;
  isTracklistActive?: boolean;
  currentItemId?: string;
}

@Component({
  templateUrl: './artist-songs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistSongsComponent implements OnDestroy {

  constructor(
    private readonly artistService: SCDKArtistService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly playerService: PlayerService,
    private readonly songService: SCSDKSongService,
  ) { }

  // Lottie animations options
  public animOptions = AUDIOWAVE_LOTTIE_OPTIONS;

  private readonly _destroy: Subject<void> = new Subject();

  /**
   * Observable that emits currently active
   * artistId extracted from the url.
   */
  public $artistId: Observable<string> = this.activatedRoute.paramMap.pipe(map((params) => params.get("artistId")));

  /**
   * Observable that emits current
   * artist data in future format
   */
  public $artist: Observable<Future<Artist>> = this.$artistId.pipe(switchMap((artistId) => this.artistService.findById(artistId).pipe(toFutureCompat())));
  
  /**
   * Observable that emits current datasource
   * of tracks
   */
  public $datasource: Observable<SCSDKDatasource<Song>> = this.$artistId.pipe(switchMap((artistId) => this.songService.findByArtistDatasource(artistId)))

  public readonly $props: Observable<ArtistSongsProps> = combineLatest([
    // Get changes to artist
    this.$artist,
    // Get paused state
    this.playerService.$isPaused.pipe(startWith(true)), 
    // Get current tracklist id
    this.playerService.$currentItem.pipe(startWith(null)),
  ]).pipe(
    // Build props object
    map(([artist, isPaused, currentItem]): ArtistSongsProps => {
      const currentTracklistId = currentItem?.tracklistId;
      const currentItemId = currentItem?.id;

      return {
        artist: artist,
        isPlaying: !isPaused && currentTracklistId === artist.data?.id,
        isTracklistActive: currentTracklistId === artist.data?.id,
        currentItemId: currentItemId
      }
    }),
  );

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public forcePlay(artist: Artist) {
    this.playerService.forcePlay(artist).subscribe();
  }

  public forcePlayAt(artist: Artist, indexAt: number, itemId: string) {
    this.playerService.forcePlayAt(artist, indexAt, itemId).subscribe();
  }

}
