import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, firstValueFrom, Observable, of, Subscription } from "rxjs";
import { Page, Pageable, PlaylistItem, Song } from "soundcore-sdk";

export interface TrackListDataSourceOptions {
  type: TrackListType;
  resourceId: string;
  apiBaseUri: string;
  pageSize: number;
  totalElements: number;
}

export type TrackListType = "byArtist" | "byPlaylist" | "byAlbum";
export class TrackListDataSource extends DataSource<Song> {

    private _cachedData = Array.from<Song>({ length: this.options.totalElements });
    private _fetchedPages = new Set<number>();
    private readonly _dataStream = new BehaviorSubject<Song[]>(this._cachedData);
    private readonly _subscription = new Subscription();
    private readonly _trackList = Array.from<PlaylistItem>({ length: this.options.totalElements })
    private _initialRequest: Subscription;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly options: TrackListDataSourceOptions
    ) {
      super();
    }
  
    public connect(collectionViewer: CollectionViewer): Observable<readonly Song[]> {
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
  
    /**
     * Disconnect the datasource.
     * This unsubscribes all subscriptions and releases
     * resources.
     */
    public disconnect(): void {
      this._subscription.unsubscribe();
      this._initialRequest?.unsubscribe();
    }
  
    /**
     * Calculate the page number by a given index.
     * @param index Index in the list to calculate its page
     * @returns Page number
     */
    private _getPageForIndex(index: number): number {
      return Math.floor(index / this.options.totalElements);
    }
  
    /**
     * Fetch a page of content based on the requested page.
     * @param pageNr Page to fetch
     */
    private _fetchPage(pageNr: number) {
      firstValueFrom(this.findInitialTrackList()).then(() => {
        // Check if page was already fetched.
        if (this._fetchedPages.has(pageNr)) {
          console.log("page " + pageNr + " already fetched")
          return;
        }

        const pageable: Pageable = { page: pageNr, size: this.options.pageSize }
        console.log("fetching next page: ", pageable)

        firstValueFrom(this.httpClient.get<Page<Song>>(`${this.options.apiBaseUri}/v1/songs/${this.options.type}/${this.options.resourceId}${Pageable.toQuery(pageable)}`)).then((page) => {
            // Add page to the fetchedPages list.
            // Only on success, because if it fails it can be refetched next time.
            this._fetchedPages.add(pageNr);
            console.log("fetched metadata page: ", page);

            // Take in the cachedData array (contains all the previously fetched items) and add the newly fetched items to it.
            this._cachedData.splice(pageNr * this.options.pageSize, this.options.pageSize, ...Array.from({ length: page.elements.length }).map((_, i) => {
                if(!page.elements[i]) return null;
                const song = Object.assign(new Song(), page.elements[i]);
                return song;
            }));

            // Push updated data array
            this._dataStream.next(this._cachedData);
        })
      })
      
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