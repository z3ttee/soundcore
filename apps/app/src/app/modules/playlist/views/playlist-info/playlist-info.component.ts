import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { SCNGXSongColConfig, SCNGXPlayableList, PlayableListBuilder } from 'soundcore-ngx';
import { Playlist, SCDKPlaylistService } from '@soundcore/sdk';
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
    private readonly playlistService: SCDKPlaylistService,
    private readonly httpClient: HttpClient,
    private readonly activatedRoute: ActivatedRoute,
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
      this.release();

      // Trigger http request.
      this._playlistSub = this.playlistService.findById(paramMap.get("playlistId")).subscribe((response) => {
        // Update state
        this.playlist = response.payload;

        // Init playable list datasource
        this.list = PlayableListBuilder
          .forPlaylist(this.httpClient)
          .useUrl(`${environment.api_base_uri}/v1/tracklist/playlist/${this.playlist.id}`)
          .build();

          this.list.$dataSource.subscribe((datasource) => {
            console.log(datasource)
          })

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
    if(!this.list?.isLocked()) {
      this.list?.release();
      this.list = null;
    }
  }

}