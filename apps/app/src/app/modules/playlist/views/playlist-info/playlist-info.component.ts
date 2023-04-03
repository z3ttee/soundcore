import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { Playlist, SCSDKPlaylistService, toFutureCompat } from '@soundcore/sdk';
import { SCNGXTracklist, SCNGXTracklistBuilder } from '@soundcore/ngx';
import { AUDIOWAVE_LOTTIE_OPTIONS } from 'src/app/constants';
import { SSOService, SSOUser } from '@soundcore/sso';

interface PlaylistInfoProps {
  playlist?: Playlist;
  tracklist?: SCNGXTracklist;
  currentlyPlaying?: any;
  currentUser?: SSOUser;

  playing?: boolean;
  loading?: boolean;
}

@Component({
  templateUrl: './playlist-info.component.html',
  styleUrls: ['./playlist-info.component.scss']
})
export class PlaylistInfoComponent implements OnInit, OnDestroy {

  private _destroy: Subject<void> = new Subject();

  // Lottie animations options
  public animOptions = AUDIOWAVE_LOTTIE_OPTIONS;

  constructor(
    private readonly playlistService: SCSDKPlaylistService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly tracklistBuilder: SCNGXTracklistBuilder,
    private readonly authService: SSOService,
    // private readonly player: AppPlayerService
  ) {}

  public readonly $props: Observable<PlaylistInfoProps> = combineLatest([
    this.activatedRoute.paramMap.pipe(
      takeUntil(this._destroy), 
      map((params) => params.get("playlistId") ?? null), 
      switchMap((playlistId) => this.playlistService.findById(playlistId)), 
      map((future) => ({
        ...future,
        data: this.tracklistBuilder.forPlaylist(future.data)
      }))),
    // this.player.$current.pipe(takeUntil(this._destroy)),
    // this.player.$isPaused.pipe(takeUntil(this._destroy)),
    this.authService.$user.pipe(takeUntil(this._destroy))
  ]).pipe(
    // Build props object
    map(([future]) => ({
      loading: future.loading,
      playlist: future.data?.context,
      // currentlyPlaying: currentItem,
      // playing: !isPaused && currentItem?.tracklist?.id == future.data?.id,
      tracklist: future.data,
      // currentUser: currentUser
    }))
  );

  public ngOnInit(): void {}

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public forcePlay(tracklist: SCNGXTracklist) {
    if(!tracklist) return;
    // this.player.playTracklist(tracklist, true).pipe(takeUntil(this._destroy)).subscribe();
  }

}