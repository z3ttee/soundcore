import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SCNGXTracklist, SCNGXTracklistBuilder } from '@soundcore/ngx';
import { LikedSong, SCSDKLikeService } from '@soundcore/sdk';
import { SSOService } from '@soundcore/sso';
import { combineLatest, map, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { AUDIOWAVE_LOTTIE_OPTIONS } from 'src/app/constants';
import { PlayerItem } from 'src/app/modules/player/entities/player-item.entity';
import { AppPlayerService } from 'src/app/modules/player/services/player.service';

interface CollectionViewProps {
  playing?: boolean;
  currentItem?: PlayerItem;

  tracklist?: SCNGXTracklist<LikedSong>;
  $size?: Observable<number>;
}

@Component({
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionComponent implements OnInit, OnDestroy {

  private readonly _destroy: Subject<void> = new Subject();
  private readonly _destroySize: Subject<void> = new Subject();

   // Lottie animations options
  public animOptions = AUDIOWAVE_LOTTIE_OPTIONS;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly likeService: SCSDKLikeService,
    private readonly player: AppPlayerService,
    private readonly tracklistBuilder: SCNGXTracklistBuilder,
    private readonly ssoService: SSOService
  ) { }

  public readonly $props: Observable<CollectionViewProps> = combineLatest([
    this.player.$current.pipe(takeUntil(this._destroy)),
    this.player.$isPaused.pipe(takeUntil(this._destroy)),
    this.ssoService.$user.pipe(
      map((ssoUser) => {
        return this.tracklistBuilder.forLikedSongs(ssoUser.id) as SCNGXTracklist<LikedSong>;
      }),
      map((tracklist): [SCNGXTracklist, Observable<number>] => {
        this._destroySize.next();
        return [tracklist, tracklist.$size.pipe(takeUntil(this._destroySize))];
      }),
      takeUntil(this._destroy)
    )
  ]).pipe(
    map(([currentItem, isPaused, [tracklist, sizeObs]]): CollectionViewProps => ({
      currentItem,
      playing: !isPaused && currentItem?.tracklist?.assocResId == tracklist?.assocResId,
      tracklist,
      $size: sizeObs
    })),
    tap((props) => console.log(props))
  );

  ngOnInit(): void {
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();

      this._destroySize.next();
      this._destroySize.complete();
  }

  public forcePlay(tracklist: SCNGXTracklist) {
    this.player.playTracklist(tracklist, true);
  }

}
