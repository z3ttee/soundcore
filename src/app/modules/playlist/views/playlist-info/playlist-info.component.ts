import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, delay, Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { Playlist, SCDKPlaylistService, Song } from 'soundcore-sdk';

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

  public tracks = new TracksDataSource();

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



class TracksDataSource extends DataSource<Song> {

  private _length = 10000;
  private _pageSize = 100;
  private _cachedData = Array.from<Song>({length: this._length});
  private _fetchedPages = new Set<number>();
  private readonly _dataStream = new BehaviorSubject<Song[]>(this._cachedData);
  private readonly _subscription = new Subscription();

  connect(collectionViewer: CollectionViewer): Observable<readonly Song[]> {
    this._subscription.add(
      collectionViewer.viewChange.subscribe(range => {
        const startPage = this._getPageForIndex(range.start);
        const endPage = this._getPageForIndex(range.end - 1);
        for (let i = startPage; i <= endPage; i++) {
          this._fetchPage(i);
        }
      }),
    );
    return this._dataStream;
  }

  disconnect(): void {
    this._subscription.unsubscribe();
  }

  private _getPageForIndex(index: number): number {
    return Math.floor(index / this._pageSize);
  }

  private _fetchPage(page: number) {
    if (this._fetchedPages.has(page)) {
      return;
    }
    this._fetchedPages.add(page);

    // Use `setTimeout` to simulate fetching data from server.
    setTimeout(() => {
      this._cachedData.splice(
        page * this._pageSize,
        this._pageSize,
        ...Array.from({length: this._pageSize}).map((_, i) => ({ 
          id: `${page * this._pageSize + i}`, 
          title: `Title Nr #${page * this._pageSize + i}`,
          duration: 236,
          liked: false,
          streamCount: 1488888888,
          explicit: true,
          artists: [
            { id: "123", name: "Artist 1" },
            { id: "124", name: "Artist 2" }
          ],
          albums: [
            { id: "123", title: "Album 1" }
          ]
        } as Song)),
      );
      this._dataStream.next(this._cachedData);
    }, Math.random() * 1000 + 200);
  }

}