import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, firstValueFrom, Observable, of, Subject, Subscription, takeUntil } from "rxjs";
import { Page, Pageable, PlaylistItem, Song } from "soundcore-sdk";
import { IPageInfo } from 'ngx-virtual-scroller';

export type TrackListType = "byArtist" | "byPlaylist" | "byAlbum";

export interface TrackListDataSourceOptions {
    type: TrackListType;
    resourceId: string;
    apiBaseUri: string;
    pageSize: number;
    totalElements: number;
}

export interface DataSourceItem {
    index: number;
    data: Song;
}

export class SCNGXTrackListDataSource {

    private _destroy: Subject<void> = new Subject();

    private _cachedData = Array.from<DataSourceItem>({ length: this.options.totalElements });
    private _fetchedPages = new Set<number>();
    private _pageFetchStatus: boolean[] = [];

    private readonly _dataStream = new BehaviorSubject<DataSourceItem[]>(this._cachedData);
    private readonly _subscription = new Subscription();
    private readonly _trackList = Array.from<PlaylistItem>({ length: this.options.totalElements })
    private _initialRequest: Subscription;
    private _isConnected: boolean = false;

    public $stream: Observable<DataSourceItem[]> = this._dataStream.asObservable().pipe(takeUntil(this._destroy));

    constructor(
        private readonly httpClient: HttpClient,
        private readonly options: TrackListDataSourceOptions
    ) {}

    public connect($onMore: Observable<IPageInfo>): Observable<DataSourceItem[]> {
        if(this._isConnected) return this._dataStream;

        this._subscription.add(
            // TODO: Add callback from virtual-scroller
            $onMore.subscribe(page => {
                const startPage = this._getPageForIndex(page.startIndex);
                const endPage = this._getPageForIndex(page.endIndex - 1);
    
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
        this._initialRequest?.unsubscribe();

        this._destroy.next();
        this._destroy.complete();
    }

    /**
     * Fetch a page of content based on the requested page.
     * @param pageNr Page to fetch
     */
    private _fetchPage(pageNr: number) {
        firstValueFrom(this.findInitialTrackList()).then(() => {
          // Check if page was already fetched.
          if (this._fetchedPages.has(pageNr) || this._pageFetchStatus[pageNr]) {
            return;
          }
  
          const pageable: Pageable = { page: pageNr, size: this.options.pageSize }
          this._pageFetchStatus[pageNr] = true;
  
          firstValueFrom(this.httpClient.get<Page<Song>>(`${this.options.apiBaseUri}/v1/songs/${this.options.type}/${this.options.resourceId}${Pageable.toQuery(pageable)}`)).then((page) => {
              // Add page to the fetchedPages list.
              // Only on success, because if it fails it can be refetched next time.
              this._fetchedPages.add(pageNr);
  
              // Take in the cachedData array (contains all the previously fetched items) and add the newly fetched items to it.
              this._cachedData.splice(pageNr * this.options.pageSize, this.options.pageSize, ...Array.from({ length: page.elements.length }).map<DataSourceItem>((_, i) => {
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
        });
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

    /**
     * Make a request to fetch the complete list of track ids for
     * a playable list. Additionally this will deliver the maximum
     * size of items as side effect which is used to virtualize the list.
     * @returns Page<PlaylistItem>
     */
    private findInitialTrackList(): Observable<Page<PlaylistItem>> {
        if(this._trackList.length <= 0) {
          return this.httpClient.get<Page<PlaylistItem>>(`${this.options.apiBaseUri}/v1/songs/${this.options.type}/${this.options.resourceId}/ids`);
        } else {
          return of(Page.of([]));
        }
    }

}