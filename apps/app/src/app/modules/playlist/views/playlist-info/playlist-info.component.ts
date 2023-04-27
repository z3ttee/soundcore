import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { Future, Playlist, SCSDKDatasource, SCSDKPlaylistService, SCSDKSongService, Song } from '@soundcore/sdk';
import { AUDIOWAVE_LOTTIE_OPTIONS } from 'src/app/constants';
import { PlayerService } from 'src/app/modules/player/services/player.service';
import { SCNGXTracklist } from 'src/app/modules/player/entities/tracklist.entity';
import { SSOService, SSOUser } from '@soundcore/sso';

interface PlaylistInfoProps {
  playlist?: Future<Playlist>;
  tracklist?: Future<SCNGXTracklist>;
  isPlaying?: boolean;
  isTracklistActive?: boolean;
  currentItemId?: string;
  user?: SSOUser;
}

@Component({
  templateUrl: './playlist-info.component.html',
  styleUrls: ['./playlist-info.component.scss']
})
export class PlaylistInfoComponent implements OnInit, OnDestroy {

  private readonly $destroy: Subject<void> = new Subject();

  constructor(
    private readonly playlistService: SCSDKPlaylistService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly playerService: PlayerService,
    private readonly songService: SCSDKSongService,
    private readonly ssoService: SSOService
  ) {}

  // Lottie animations options
  public animOptions = AUDIOWAVE_LOTTIE_OPTIONS;

  /**
   * Observable that emits currently active
   * playlistId extracted from the url.
   */
  public $playlistId: Observable<string> = this.activatedRoute.paramMap.pipe(map((params) => params.get("playlistId")));

  /**
   * Observable that emits current
   * playlist data in future format
   */
  public $playlist: Observable<Future<Playlist>> = this.$playlistId.pipe(switchMap((playlistId) => this.playlistService.findById(playlistId)));

  /**
   * Observable that emits current datasource
   * of tracks
   */
  public $datasource: Observable<SCSDKDatasource<Song>> = this.$playlistId.pipe(switchMap((playlistId) => this.songService.findByPlaylistDatasource(playlistId)));
  
  public readonly $props: Observable<PlaylistInfoProps> = combineLatest([
    // Get changes to playlist
    this.$playlist,
    // Get paused state
    this.playerService.$isPaused.pipe(startWith(true)), 
    // Get current tracklist id
    this.playerService.$currentItem.pipe(startWith(null)),
    // Get user data
    this.ssoService.$user
  ]).pipe(
    // Build props object
    map(([playlist, isPaused, currentItem, user]): PlaylistInfoProps => {
      const currentTracklistId = currentItem?.owner?.id;
      const currentItemId = currentItem?.id;

      return {
        playlist: playlist,
        isPlaying: !isPaused && currentTracklistId === playlist.data?.id,
        isTracklistActive: currentTracklistId === playlist.data?.id,
        currentItemId: currentItemId,
        user: user
      };
    }),
    takeUntil(this.$destroy)
  );

  public ngOnInit(): void {}

  public ngOnDestroy(): void {
      this.$destroy.next();
      this.$destroy.complete();
  }

  public forcePlay(playlist: Playlist) {
    this.playerService.forcePlay(playlist).subscribe();
  }

  public forcePlayAt(playlist: Playlist, indexAt: number, itemId: string) {
    this.playerService.forcePlayAt(playlist, indexAt, itemId).subscribe();
  }

}