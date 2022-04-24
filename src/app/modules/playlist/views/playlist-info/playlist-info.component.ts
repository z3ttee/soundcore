import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { SCNGXSongColConfig, TrackListDataSource } from 'soundcore-ngx';
import { Playlist, SCDKPlaylistService } from 'soundcore-sdk';
import { environment } from 'src/environments/environment';

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
  public tracks: TrackListDataSource;

  public columns: SCNGXSongColConfig = {
    id: { enabled: true, collapseAt: 380 },
    cover: { enabled: true },
    album: { enabled: true, collapseAt: 560 },
    date: { enabled: true, collapseAt: 900 },
    duration: { enabled: true, collapseAt: 0 }
  }

  constructor(
    private readonly httpClient: HttpClient,
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
      this.tracks = null;

      // Trigger http request.
      this._playlistSub = this.playlistService.findById(paramMap.get("playlistId")).subscribe((playlist) => {
        // Update state
        this.playlist = playlist;

        // Init playable list datasource
        this.tracks = new TrackListDataSource(this.httpClient, {
          type: "byPlaylist",
          resourceId: this.playlist.id,
          apiBaseUri: environment.api_base_uri,
          pageSize: 50,
          totalElements: this.playlist.songsCount
        });

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
      this.tracks.disconnect();
  }

}