import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { PlayableListBuilder, SCNGXPlayableList, SCNGXPlayableTracklist, SCNGXSongColConfig } from '@soundcore/ngx';
import { Album, SCDKAlbumService } from '@soundcore/sdk';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './album-info.component.html',
  styleUrls: ['./album-info.component.scss']
})
export class AlbumInfoComponent implements OnInit, OnDestroy {

  constructor(
    private readonly httpClient: HttpClient,
    private readonly albumService: SCDKAlbumService,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  private readonly _destroy: Subject<void> = new Subject();
  private readonly _cancel: Subject<void> = new Subject();

  private readonly _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private readonly _albumSubject: BehaviorSubject<Album> = new BehaviorSubject(null);
  private readonly _listSubject: BehaviorSubject<SCNGXPlayableTracklist> = new BehaviorSubject(null);
  private readonly _featAlbumSubject: BehaviorSubject<Album[]> = new BehaviorSubject([]);

  public readonly $loading: Observable<boolean> = this._loadingSubject.asObservable();
  public readonly $album: Observable<Album> = this._albumSubject.asObservable();
  public readonly $list: Observable<SCNGXPlayableTracklist> = this._listSubject.asObservable();
  public readonly $featAlbums: Observable<Album[]> = this._featAlbumSubject.asObservable();

  public columns: SCNGXSongColConfig = {
    id: { enabled: true, collapseAt: 420 },
    count: { enabled: true, collapseAt: 560 },
    duration: { enabled: true, collapseAt: 0 }
  }

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this._destroy)).subscribe((paramMap) => {
      this._cancel.next();
      const albumId = paramMap.get("albumId");

      this._albumSubject.next(null);
      this._loadingSubject.next(true);
      this._albumSubject.next(null);
      this._featAlbumSubject.next([]);
      this._listSubject.next(null);

      this.albumService.findById(albumId).pipe(takeUntil(this._cancel)).subscribe((response) => {
        const album = response.payload;
        this._albumSubject.next(album);
        if(!album) return;

        this._listSubject.next(PlayableListBuilder
          .forTracklist(this.httpClient)
          .useUrl(`${environment.api_base_uri}/v1/songs/byAlbum/${album.id}`)
          .build());

        this.albumService.findRecommendedByArtist(album.primaryArtist?.id).pipe(takeUntil(this._cancel)).subscribe((response) => {
          this._featAlbumSubject.next(response.payload.elements);
        })

        this._loadingSubject.next(false)
      })
    })
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();

      this._cancel.next();
      this._cancel.complete();
  }

}
