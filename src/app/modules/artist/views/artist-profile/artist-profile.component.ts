import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { SCNGXPlayableList, SCNGXSongColConfig } from 'soundcore-ngx';
import { Artist, SCDKArtistService } from 'soundcore-sdk';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-artist-profile',
  templateUrl: './artist-profile.component.html',
  styleUrls: ['./artist-profile.component.scss']
})
export class ArtistProfileComponent implements OnInit, OnDestroy {

  constructor(
    private readonly artistService: SCDKArtistService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly httpClient: HttpClient
  ) { }

  private readonly _destroy: Subject<void> = new Subject();
  private readonly _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private readonly _artistSubject: BehaviorSubject<Artist> = new BehaviorSubject(null);
  private readonly _listSubject: BehaviorSubject<SCNGXPlayableList> = new BehaviorSubject(null);

  public readonly $loading: Observable<boolean> = this._loadingSubject.asObservable();
  public readonly $artist: Observable<Artist> = this._artistSubject.asObservable();
  public readonly $list: Observable<SCNGXPlayableList> = this._listSubject.asObservable();

  public readonly songListCols: SCNGXSongColConfig = {
    id: { enabled: true, collapseAt: 420 },
    cover: { enabled: true },
    count: { enabled: true, collapseAt: 450 },
    duration: { enabled: true, collapseAt: 380 }
  }

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this._destroy)).subscribe((paramMap) => {
      const artistId = paramMap.get("artistId");

      this._loadingSubject.next(true);
      this._artistSubject.next(null);

      // TODO: Check if playable list is not enqueued
      this._listSubject.getValue()?.release();

      this.artistService.findById(artistId).pipe(takeUntil(this._destroy)).subscribe((artist) => {
        this._artistSubject.next(artist);
        this._loadingSubject.next(false);

        this._listSubject.next(new SCNGXPlayableList(this.httpClient, {
          detailsUrl: `${environment.api_base_uri}/v1/songs/byArtist/${artist.id}`,
          tracksUrl: `${environment.api_base_uri}/v1/songs/byArtist/${artist.id}/ids`
        }))
      })
    })
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

}
