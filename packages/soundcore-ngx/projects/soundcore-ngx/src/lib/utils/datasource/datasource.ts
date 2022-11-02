import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of, Subject, Subscription, switchMap, takeUntil } from "rxjs";
import { ApiResponse, Page, Pageable } from "@soundcore/sdk";
import { IPageInfo } from '@tsalliance/ngx-virtual-scroller';
import { v4 as uuidv4 } from "uuid";
import { apiResponse } from "@soundcore/sdk";

export const SCNGX_DATASOURCE_PAGE_SIZE = 50;
export interface DatasourceOptions {
    /**
     * URL that points to the detailed tracks endpoint.
     * Endpoint should be the one which actually returns the
     * metadata of tracks.
     */
    url: string;

    /**
     * Page size
     */
    pageSize?: number;
}

export interface DatasourceItem<T> {
    index: number;
    data: T;
}

export abstract class BaseDatasource<T> {
    public readonly id: string = uuidv4();
    protected readonly _destroy: Subject<void> = new Subject();

    protected readonly _cachedData = Array.from<DatasourceItem<T>>([]);
    protected readonly _fetchedPages = new Set<number>();
    protected readonly _pageFetchStatus: boolean[] = [];

    protected readonly _dataStream = new BehaviorSubject<DatasourceItem<T>[]>(this._cachedData);
    private readonly _subscription = new Subscription();
    private _isConnected: boolean = false;
    private _totalElements: number = 0;

    public readonly $stream: Observable<DatasourceItem<T>[]> = this._dataStream.asObservable().pipe(takeUntil(this._destroy));

    public get size(): number {
        return this._totalElements;
    }

    constructor(
        protected readonly httpClient: HttpClient,
        protected readonly options: DatasourceOptions
    ) {}

    public connect($onMore: Observable<IPageInfo>): Observable<DatasourceItem<T>[]> {
        if(this._isConnected) return this._dataStream;

        this._subscription.add(
            $onMore.subscribe(page => {
                const startPage = this.getPageForIndex(page.startIndex);
                const endPage = this.getPageForIndex(page.endIndex);
    
                for (let i = startPage; i <= endPage; i++) {
                    this.fetchPage(i).subscribe();
                }
            }),
        );

        // Fetch initial page
        this.fetchPage(0).subscribe();
  
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
        const newElement: DatasourceItem<T> = {
            data: element,
            index: this._cachedData.length - 1
        }

        // Add to stream
        this._cachedData.push(newElement);
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
    protected fetchPage(pageNr: number): Observable<DatasourceItem<T>[]> {
        const pageable: Pageable = new Pageable(pageNr, (this.options.pageSize || SCNGX_DATASOURCE_PAGE_SIZE));
        if(this._totalElements > 0 && this._totalElements <= this._dataStream.getValue().length) return of([]);

        // Check if page was already fetched or has invalid page settings.
        if (pageNr < 0 || pageable.limit <= 0 || this._fetchedPages.has(pageNr) || this._pageFetchStatus[pageNr]) {
            return of([]);
        }
  
        this._pageFetchStatus[pageNr] = true;

        return this.httpClient.get<Page<T>>(`${this.options.url}${pageable.toQuery()}`).pipe(
            apiResponse(),
            switchMap((response: ApiResponse<Page<T>>): Observable<DatasourceItem<T>[]> => {
                // Page is not being fetched as the request is over
                // at this point.
                this._pageFetchStatus[pageNr] = false;

                if(response.error) {
                    return of([]);
                }

                const page = response.payload;
                // Add page to the fetchedPages list.
                // Only on success, because if it fails it can be refetched next time.
                this._fetchedPages.add(pageNr);
                this._totalElements = page.totalElements;
    
                // Take in the cachedData array (contains all the previously fetched items) and add the newly fetched items to it.
                this._cachedData.splice(pageable.offset, pageable.limit, ...Array.from({ length: page.elements.length }).map<DatasourceItem<T>>((_, i) => {
                    if(!page.elements[i]) return null;
                    const element = Object.assign({}, page.elements[i]);
                    return {
                        data: element,
                        index: this.getIndexForPageAndItemIndex(pageNr, i)
                    };
                }));
    
                // Push updated data array
                this._dataStream.next(this._cachedData);

                return of(this._cachedData);
            })
        );

        /*return firstValueFrom(this.httpClient.get<Page<T>>(`${this.options.url}${pageable.toQuery()}`)).then((page) => {
            // Add page to the fetchedPages list.
            // Only on success, because if it fails it can be refetched next time.
            this._fetchedPages.add(pageNr);
            this._totalElements = page.totalElements;
  
            // Take in the cachedData array (contains all the previously fetched items) and add the newly fetched items to it.
            this._cachedData.splice(pageNr * pageable.size, pageable.size, ...Array.from({ length: page.elements.length }).map<DatasourceItem<T>>((_, i) => {
                if(!page.elements[i]) return null;
                const element = Object.assign({}, page.elements[i]);
                return {
                    data: element,
                    index: this.getIndexForPageAndItemIndex(pageNr, i)
                };
            }));
  
            // Push updated data array
            this._dataStream.next(this._cachedData);
        }).finally(() => this._pageFetchStatus[pageNr] = false);*/
    }

    /**
     * Calculate the page number by a given index.
     * @param index Index in the list to calculate its page
     * @returns Page number
     */
    protected getPageForIndex(index: number): number {
        return Math.floor(index / (this.options.pageSize || SCNGX_DATASOURCE_PAGE_SIZE));
    }

    protected getIndexForPageAndItemIndex(pageNr: number, index: number): number {
        const amount = pageNr * SCNGX_DATASOURCE_PAGE_SIZE;
        return amount + index;
    }
}

