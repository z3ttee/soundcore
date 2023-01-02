import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { SCNGXTracklist, SCNGXTracklistBuilder } from '@soundcore/ngx';
import { LikedSong, SCSDKLikeService } from '@soundcore/sdk';
import { SSOService, SSOUser } from '@soundcore/sso';
import { combineLatest, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { AUDIOWAVE_LOTTIE_OPTIONS } from 'src/app/constants';
import { PlayerItem } from 'src/app/modules/player/entities/player-item.entity';
import { AppPlayerService } from 'src/app/modules/player/services/player.service';

interface CollectionViewProps {
  playing?: boolean;
  currentItem?: PlayerItem;

  tracklist?: SCNGXTracklist<LikedSong>;
  user?: SSOUser;
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
    private readonly ssoService: SSOService,
    private readonly snackbar: MatSnackBar
  ) { }

  public readonly $props: Observable<CollectionViewProps> = combineLatest([
    this.player.$current.pipe(takeUntil(this._destroy)),
    this.player.$isPaused.pipe(takeUntil(this._destroy)),
    this.ssoService.$user.pipe(
      map((ssoUser): [SSOUser, SCNGXTracklist<LikedSong>] => {
        return [ssoUser, this.tracklistBuilder.forLikedSongs(ssoUser.id) as SCNGXTracklist<LikedSong>];
      }),
      takeUntil(this._destroy)
    )
  ]).pipe(
    map(([currentItem, isPaused, [ssoUser, tracklist]]): CollectionViewProps => ({
      currentItem,
      playing: !isPaused && currentItem?.tracklist?.id == tracklist?.id,
      tracklist,
      user: ssoUser
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

  public forcePlay(tracklist: SCNGXTracklist<LikedSong>) {
    this.player.playTracklist(tracklist, true).subscribe();
  }

  public removeFromCollection(likedSong: LikedSong, tracklist: SCNGXTracklist<LikedSong>) {
    this.likeService.toggleLikeForSong(likedSong.song).pipe(takeUntil(this._destroy)).subscribe((request) => {
      if(request.loading) return;
      if(request.error) {
        this.snackbar.open(`Ein Fehler ist aufgetreten.`, null, { duration: 5000 });
        return;
      }
      
      console.log(likedSong);
      tracklist.remove(likedSong);
      this.snackbar.open(`Song aus Lieblingssongs entfernt`, null, { duration: 5000 });
    })
  }

}
