import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { SCNGXSongColConfig, SCNGXPlayableList } from 'soundcore-ngx';
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

  // public tracks: SCNGXTrackListDataSource;
  public items = []

  public list: SCNGXPlayableList;

  public columns: SCNGXSongColConfig = {
    id: { enabled: true, collapseAt: 420 },
    cover: { enabled: true },
    album: { enabled: true, collapseAt: 560 },
    date: { enabled: true, collapseAt: 900 },
    duration: { enabled: true, collapseAt: 0 }
  }

  constructor(
    private readonly httpClient: HttpClient,
    private readonly activatedRoute: ActivatedRoute,
    private readonly playlistService: SCDKPlaylistService
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

      // Close down previously initialized list
      // TODO: Check if playable list is not enqueued
      this.list?.release();
      this.list = null;
      // this.tracks = null;

      // Trigger http request.
      this._playlistSub = this.playlistService.findById(paramMap.get("playlistId")).subscribe((playlist) => {
        // Update state
        this.playlist = playlist;

        // Init playable list datasource
        this.list = new SCNGXPlayableList(this.httpClient, {
          detailsUrl: `${environment.api_base_uri}/v1/songs/byPlaylist/${this.playlist.id}`,
          tracksUrl: `${environment.api_base_uri}/v1/songs/byPlaylist/${this.playlist.id}/ids`
        })

        /*this.tracks = new SCNGXTrackListDataSource(
          this.httpClient, 
          {
            type: "byPlaylist",
            resourceId: this.playlist.id,
            apiBaseUri: environment.api_base_uri,
            pageSize: 50,
            totalElements: this.playlist.songsCount
          }
        );*/

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
      // this.tracks.disconnect();
      this.list.release();
  }

}