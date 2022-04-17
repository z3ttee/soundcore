import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Playlist, SCDKPlaylistService } from 'soundcore-sdk';

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

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly playlistService: SCDKPlaylistService
  ) { }

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this._destroy)).subscribe((paramMap) => {
      // Cancel ongoing http request.
      this._cancel.next();

      // Reset state
      this.isLoadingPlaylist = true;
      this.showError404 = false;
      this.playlist = null;

      // Trigger http request.
      this._playlistSub = this.playlistService.findById(paramMap.get("playlistId")).subscribe((playlist) => {
        // Update state
        this.playlist = playlist;
        this.showError404 = !playlist;
        this.isLoadingPlaylist = false;
      })
    })

    // Cancel ongoing http request.
    this._cancel.pipe(takeUntil(this._destroy)).subscribe(() => {
      this._playlistSub?.unsubscribe();
    })
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

}
