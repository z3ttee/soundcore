import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { Playlist, SCSDKPlaylistService, toFutureCompat } from '@soundcore/sdk';
import { AppPlayerService } from 'src/app/modules/player/services/player.service';
import { SCNGXTracklist, SCNGXTracklistBuilder } from '@soundcore/ngx';
import { PlayerItem } from 'src/app/modules/player/entities/player-item.entity';
import { AUDIOWAVE_LOTTIE_OPTIONS } from 'src/app/constants';

interface PlaylistInfoProps {
  playlist?: Playlist;
  tracklist?: SCNGXTracklist;
  currentlyPlaying?: PlayerItem;

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
    private readonly player: AppPlayerService
  ) {}

  public readonly $props: Observable<PlaylistInfoProps> = combineLatest([
    this.activatedRoute.paramMap.pipe(
      takeUntil(this._destroy), 
      map((params) => params.get("playlistId") ?? null), 
      switchMap((playlistId) => this.playlistService.findById(playlistId).pipe(toFutureCompat())), 
      map((future) => ({
        ...future,
        data: this.tracklistBuilder.forPlaylist(future.data)
      }))),
    this.player.$current.pipe(takeUntil(this._destroy)),
    this.player.$isPaused.pipe(takeUntil(this._destroy))
  ]).pipe(
    // Build props object
    map(([future, currentItem, isPaused]) => ({
      loading: future.loading,
      playlist: future.data?.context,
      currentlyPlaying: currentItem,
      playing: !isPaused && currentItem?.tracklist?.id == future.data?.id,
      tracklist: future.data
    }))
  );

  public ngOnInit(): void {}

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public forcePlay(tracklist: SCNGXTracklist) {
    if(!tracklist) return;
    this.player.playTracklist(tracklist, true).pipe(takeUntil(this._destroy)).subscribe();
  }

}