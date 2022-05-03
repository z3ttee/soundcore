import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, firstValueFrom, Observable, Subject, Subscription, takeUntil } from "rxjs";
import { Page, Pageable, Song } from "soundcore-sdk";
import { IPageInfo } from 'ngx-virtual-scroller';

export type TrackListType = "byArtist" | "byPlaylist" | "byAlbum";

export interface TrackListDataSourceOptions {
    /**
     * URL that points to the detailed tracks endpoint.
     * Endpoint should be the one which actually returns the
     * metadata of tracks.
     */
    url: string;

    /**
     * Size of page on every pagination request.
     */
    pageSize: number;

    /**
     * Maximum amount of retrievable elements.
     * Used for pagination.
     */
    totalElements: number;
}

export interface TrackDataSourceItem {
    index: number;
    data: Song;
}

export class SCNGXTrackListDataSourceV2 {

    private _destroy: Subject<void> = new Subject();

    private _cachedData = Array.from<TrackDataSourceItem>({ length: this.options.totalElements });
    private _fetchedPages = new Set<number>();
    private _pageFetchStatus: boolean[] = [];

    private readonly _dataStream = new BehaviorSubject<TrackDataSourceItem[]>(this._cachedData);
    private readonly _subscription = new Subscription();
    private _isConnected: boolean = false;

    public $stream: Observable<TrackDataSourceItem[]> = this._dataStream.asObservable().pipe(takeUntil(this._destroy));

    constructor(
        private readonly httpClient: HttpClient,
        private readonly options: TrackListDataSourceOptions
    ) {}

    public connect($onMore: Observable<IPageInfo>): Observable<TrackDataSourceItem[]> {
        if(this._isConnected) return this._dataStream;

        this._subscription.add(
            $onMore.subscribe(page => {
                const startPage = this._getPageForIndex(page.startIndex);
                const endPage = this._getPageForIndex(page.endIndex);
    
                for (let i = startPage; i <= endPage; i++) {
                    this._fetchPage(i);
                }
            }),
        );
  
        this._isConnected = true;
        return this._dataStream;
    }

    /**
     * Disconnect the datasource.
     * This unsubscribes all subscriptions and releases
     * resources.
     */
    public disconnect(): void {
        this._subscription.unsubscribe();

        this._destroy.next();
        this._destroy.complete();
    }

    /**
     * Fetch a page of content based on the requested page.
     * @param pageNr Page to fetch
     */
    private _fetchPage(pageNr: number) {
          // Check if page was already fetched or has invalid page settings.
          if (pageNr < 0 || this.options.pageSize <= 0 || this._fetchedPages.has(pageNr) || this._pageFetchStatus[pageNr]) {
            return;
          }
  
          // Update fetch status to true
          // If the same page will be fetched a short time after again,
          // this would result in race conditions or redundant requests.
          // So its just to wait for a response of the very first request that
          // was made for that specific page.
          this._pageFetchStatus[pageNr] = true;

          // Build page settings
          const pageable: Pageable = { page: pageNr, size: this.options.pageSize }
  
          // Execute request to the detailsUrl
          firstValueFrom(this.httpClient.get<Page<Song>>(`${this.options.url}${Pageable.toQuery(pageable)}`)).then((page) => {
              // Add page to the fetchedPages list.
              // Only on success, because if it fails it can be refetched next time.
              this._fetchedPages.add(pageNr);
  
              // Take in the cachedData array (contains all the previously fetched items) and add the newly fetched items to it.
              this._cachedData.splice(pageNr * this.options.pageSize, this.options.pageSize, ...Array.from({ length: page.elements.length }).map<TrackDataSourceItem>((_, i) => {
                  if(!page.elements[i]) return null;
                  const song = Object.assign(new Song(), page.elements[i]);

                  return {
                      index: this._getIndexForPageAndItemIndex(pageNr, i),
                      data: song
                  };
              }));
  
              // Push updated data array
              this._dataStream.next(this._cachedData);
          }).finally(() => this._pageFetchStatus[pageNr] = false);
    }

    /**
     * Calculate the page number by a given index.
     * @param index Index in the list to calculate its page
     * @returns Page number
     */
    private _getPageForIndex(index: number): number {
        return Math.floor(index / this.options.pageSize);
    }

    private _getIndexForPageAndItemIndex(pageNr: number, index: number): number {
        const amount = pageNr * this.options.pageSize;
        return amount + index;
    }

}