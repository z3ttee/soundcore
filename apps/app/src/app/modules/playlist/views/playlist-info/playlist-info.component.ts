import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Playlist, SCSDKPlaylistService } from '@soundcore/sdk';
import { AppPlayerService } from 'src/app/modules/player/services/player.service';
import { SCNGXTracklist, SCNGXTracklistBuilder } from '@soundcore/ngx';

@Component({
  templateUrl: './playlist-info.component.html',
  styleUrls: ['./playlist-info.component.scss']
})
export class PlaylistInfoComponent implements OnInit, OnDestroy {

  private _destroy: Subject<void> = new Subject();
  private _cancel: Subject<void> = new Subject();
  private _playlistSub: Subscription;

  public showError404: boolean = false;
  public isLoadingPlaylist: boolean = false;
  public playlist: Playlist;

  public items = []
  public tracklist: SCNGXTracklist;

  constructor(
    private readonly playlistService: SCSDKPlaylistService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly tracklistBuilder: SCNGXTracklistBuilder,
    private readonly player: AppPlayerService
  ) {
    for(let i = 0; i < 100000; i++) {
      this.items.push(i);
    }
  }


  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this._destroy)).subscribe((paramMap) => {
      console.log(paramMap)

      // Cancel ongoing http request.
      this._cancel.next();

      // Reset state
      this.isLoadingPlaylist = true;
      this.showError404 = false;
      this.playlist = null;
      this.tracklist = null;

      // Close down previously initialized list
      this.release();

      // Trigger http request.
      this._playlistSub = this.playlistService.findById(paramMap.get("playlistId")).subscribe((response) => {
        // Update state
        this.playlist = response.payload;

        this.tracklist = this.tracklistBuilder.forPlaylist(this.playlist);

        this.showError404 = !response.payload;
        this.isLoadingPlaylist = false;
      })
    })

    // Cancel ongoing http request.
    this._cancel.pipe(takeUntil(this._destroy)).subscribe(() => {
      this._playlistSub?.unsubscribe();
    })
  }

  public ngOnDestroy(): void {
      this.release();

      this._destroy.next();
      this._destroy.complete();
  }

  public release() {
    // if(!this.list?.isLocked()) {
    //   this.list?.release();
    //   this.list = null;
    // }
  }

  public forcePlay() {
    this.player.playTracklist(this.tracklist, true);
  }

}