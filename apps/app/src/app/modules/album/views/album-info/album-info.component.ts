import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { Album, SCDKAlbumService } from '@soundcore/sdk';
import { SCNGXSongColConfig, SCNGXTracklist, SCNGXTracklistBuilder } from '@soundcore/ngx';
import { AppPlayerService } from 'src/app/modules/player/services/player.service';

@Component({
  templateUrl: './album-info.component.html',
  styleUrls: ['./album-info.component.scss']
})
export class AlbumInfoComponent implements OnInit, OnDestroy {

  constructor(
    private readonly albumService: SCDKAlbumService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly tracklistBuilder: SCNGXTracklistBuilder,
    private readonly player: AppPlayerService
  ) { }

  private readonly _destroy: Subject<void> = new Subject();
  private readonly _cancel: Subject<void> = new Subject();

  public showError404: boolean = false;
  public album: Album;
  public isLoadingAlbum: boolean = true;
  public featuredAlbums: Album[];
  public tracklist?: SCNGXTracklist;

  public columns: SCNGXSongColConfig = {
    id: { enabled: true, collapseAt: 420 },
    count: { enabled: true, collapseAt: 560 },
    duration: { enabled: true, collapseAt: 0 }
  }

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this._destroy)).subscribe((paramMap) => {
      this._cancel.next();
      const albumId = paramMap.get("albumId");

      // Reset internal state
      this.album = null;
      this.featuredAlbums = [];
      this.isLoadingAlbum = true;
      this.tracklist = undefined;

      this.albumService.findById(albumId).pipe(takeUntil(this._cancel)).subscribe((response) => {
        const album = response.payload;
        if(!album || response.error) {
          this.showError404 = true;
          return;
        }

        this.album = album;
        this.isLoadingAlbum = false;
        this.tracklist = this.tracklistBuilder.forAlbum(album);

        this.albumService.findRecommendedByArtist(album.primaryArtist?.id, [album.id]).pipe(takeUntil(this._cancel)).subscribe((response) => {
          this.featuredAlbums = response.payload.elements;
        });
      });
    })
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();

      this._cancel.next();
      this._cancel.complete();
  }

  public forcePlay() {
    this.player.playTracklist(this.tracklist);
  }

}
