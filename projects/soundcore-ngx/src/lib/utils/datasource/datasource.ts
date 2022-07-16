import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, firstValueFrom, Observable, Subject, Subscription, takeUntil } from "rxjs";
import { Page, Pageable } from "soundcore-sdk";
import { IPageInfo } from '@tsalliance/ngx-virtual-scroller';
import { v4 as uuidv4 } from "uuid";

export interface InfiniteDataSourceOptions {
    pageSize: number;
    url: string;
}

/**
 * Datasource class to handle
 * infinite scroll fetching more
 * easily
 */
export class InfiniteDataSource<T> {

    public readonly id: string = uuidv4();
    private _destroy: Subject<void> = new Subject();

    private _cachedData = Array.from<T>([]);
    private _fetchedPages = new Set<number>();
    private _pageFetchStatus: boolean[] = [];

    private readonly _dataStream = new BehaviorSubject<T[]>(this._cachedData);
    private readonly _subscription = new Subscription();
    private _isConnected: boolean = false;
    private _totalElements: number = 0;

    public $stream: Observable<T[]> = this._dataStream.asObservable().pipe(takeUntil(this._destroy));

    constructor(
        private readonly httpClient: HttpClient,
        private readonly options: InfiniteDataSourceOptions
    ) {}

    public connect($onMore: Observable<IPageInfo>): Observable<T[]> {
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

        this._fetchPage(0);
  
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
     * EXPERIMENTAL Append an element to the dataStream
     * @param element Element to add
     * @returns Index the element got in the dataStream
     */
    public append(element: T): number {
        // Add to stream
        this._cachedData.push(element);
        const index = this._cachedData.length - 1;

        // Increment totalElements by 1
        this._totalElements += 1;

        // Update stream
        this._dataStream.next(this._cachedData);

        return index;
    }

    /**
     * Fetch a page of content based on the requested page.
     * @param pageNr Page to fetch
     */
    private _fetchPage(pageNr: number) {
        const pageable: Pageable = new Pageable(pageNr, this.options.pageSize);
        if(this._totalElements > 0 && this._totalElements <= this._dataStream.getValue().length) return;

        // Check if page was already fetched or has invalid page settings.
        if (pageNr < 0 || this.options.pageSize <= 0 || this._fetchedPages.has(pageNr) || this._pageFetchStatus[pageNr]) {
            return;
        }
  
        this._pageFetchStatus[pageNr] = true;
        firstValueFrom(this.httpClient.get<Page<T>>(`${this.options.url}${pageable.toQuery()}`)).then((page) => {
            // Add page to the fetchedPages list.
            // Only on success, because if it fails it can be refetched next time.
            this._fetchedPages.add(pageNr);
            this._totalElements = page.totalElements;
  
            // Take in the cachedData array (contains all the previously fetched items) and add the newly fetched items to it.
            this._cachedData.splice(pageNr * this.options.pageSize, this.options.pageSize, ...Array.from({ length: page.elements.length }).map<T>((_, i) => {
                if(!page.elements[i]) return null;
                const element = Object.assign({}, page.elements[i]);
                return element;
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

    /**
     * Make a request to fetch the complete list of track ids for
     * a playable list. Additionally this will deliver the maximum
     * size of items as side effect which is used to virtualize the list.
     * @returns Page<PlaylistItem>
     */
    private fetchInitialPage(): Observable<Page<T>> {
        return this.httpClient.get<Page<T>>(`${this.options.url}${Pageable.queryOf(0, this.options.pageSize)}`);
    }

}