import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService, Profile } from '@repo/angular-oidc';
import { LikedSong, SCSDKLikeService, ToggleLikedSongDTO } from '@repo/angular-sdk';
import { SCNGXTracklist, SCNGXTracklistBuilder } from '@repo/angular-ui';
import { combineLatest, filter, map, Observable, Subject, take, takeUntil } from 'rxjs';
import { AUDIOWAVE_LOTTIE_OPTIONS } from 'src/app/constants';

interface CollectionViewProps {
  playing?: boolean;
  currentItem?: any;

  tracklist?: SCNGXTracklist<LikedSong>;
  user?: Profile;
  latestLikeChange?: ToggleLikedSongDTO;
}

@Component({
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class CollectionComponent implements OnInit, OnDestroy {

  private readonly _destroy: Subject<void> = new Subject();
  private readonly _destroySize: Subject<void> = new Subject();

  // Lottie animations options
  public animOptions = AUDIOWAVE_LOTTIE_OPTIONS;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly likeService: SCSDKLikeService,
    // private readonly player: AppPlayerService,
    private readonly tracklistBuilder: SCNGXTracklistBuilder,
    private readonly ssoService: AuthenticationService,
    private readonly snackbar: MatSnackBar
  ) { }

  public readonly $props: Observable<CollectionViewProps> = combineLatest([
    // this.player.$current.pipe(takeUntil(this._destroy)),
    // this.player.$isPaused.pipe(takeUntil(this._destroy)),
    this.ssoService.$profile.pipe(
      map((ssoUser): [Profile, SCNGXTracklist<LikedSong>] => {
        return [ssoUser, this.tracklistBuilder.forLikedSongs(ssoUser.sub) as SCNGXTracklist<LikedSong>];
      }),
      takeUntil(this._destroy)
    )
  ]).pipe(
    map(([[ssoUser, tracklist]]): CollectionViewProps => ({
      // currentItem,
      // playing: !isPaused && currentItem?.tracklist?.id == tracklist?.id,
      tracklist,
      user: ssoUser,
    }))
  );

  ngOnInit(): void {
    this.likeService.$onSongLikeChanged.pipe(filter((result) => !!result), takeUntil(this._destroy)).subscribe((toggleResult) => {
      const likedSong = toggleResult.song;
      const isLiked = toggleResult.isLiked;

      this.$props.pipe(take(1), takeUntil(this._destroy)).subscribe(({ tracklist }) => {
        if (isLiked) {
          this.addToCollection(likedSong, tracklist);
        } else {
          this.removeFromCollection(likedSong, tracklist);
        }
      });
    })
  }

  public ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();

    this._destroySize.next();
    this._destroySize.complete();
  }

  public forcePlay(tracklist: SCNGXTracklist<LikedSong>) {
    // this.player.playTracklist(tracklist, true).subscribe();
  }

  public toggleAndRemoveFromCollection(likedSong: LikedSong, tracklist: SCNGXTracklist<LikedSong>) {
    this.likeService.toggleLikeForSong(likedSong.song).pipe(takeUntil(this._destroy)).subscribe((request) => {
      if (request.loading) return;
      if (request.error) {
        this.snackbar.open(`Ein Fehler ist aufgetreten.`, null, { duration: 3000 });
        return;
      }
    })
  }

  public removeFromCollection(likedSong: LikedSong, tracklist: SCNGXTracklist<LikedSong>) {
    tracklist.removeById(likedSong.id);
    this.snackbar.open(`Song aus Lieblingssongs entfernt`, null, { duration: 3000 });
  }

  public addToCollection(likedSong: LikedSong, tracklist: SCNGXTracklist<LikedSong>) {
    console.log(likedSong);
    tracklist.prepend(likedSong);
  }

}
