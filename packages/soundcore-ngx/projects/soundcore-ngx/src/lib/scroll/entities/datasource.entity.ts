import { IAdapter, IDatasource, SizeStrategy } from "ngx-ui-scroll";
import { DatasourceGet, Settings, DevSettings } from "vscroll/dist/typings/interfaces";
import { v4 as uuidv4 } from "uuid";
import { Observable, of, Subject, switchMap, takeUntil } from "rxjs";
import { DatasourceItem } from "./datasource-item.entity";
import { ApiResponse, apiResponse, Page, IndexPageable, Pageable } from "@soundcore/sdk";
import { Pagination } from "../config/datasource-pagination";
import { HttpClient } from "@angular/common/http";

enum PageFetchStatus {
    OK = 0,
    FETCHING = 1,
    ERROR = 2
}

export class SCNGXDatasource<T = any> implements IDatasource {

    public readonly id: string = uuidv4();
    // protected readonly cachedData: DatasourceItem<T>[] = Array.from<DatasourceItem<T>>([]);
    protected readonly cachedPages: Map<number, DatasourceItem<T>> = new Map();

    private _totalElements: number = -1;

    /**
     * Subject used to trigger destroying the datasource.
     * Once the subject emits, the resources of the datasource are freed
     * and the datasource gets closed.
     */
    protected readonly _destroy: Subject<void> = new Subject();

    /**
     * Set for tracking the pages that already have been fetched.
     */
    protected readonly _fetchedPageIndexes: Set<number> = new Set();

    /**
     * Map for tracking current status of a fetching process for a page.
     * Keys are the index of a page and the values are true or false. True
     * means page was successfully fetched, otherwise it will be false.
     */
    protected readonly _fetchedPageStatus: Map<number, PageFetchStatus> = new Map();

    /**
     * Property required by the IDatasource interface of vscroll
     * Currently unused.
     */
    public readonly adapter?: IAdapter<unknown>;

    /**
     * Property required by the IDatasource interface of vscroll
     * Currently unused.
     */
    public readonly devSettings?: DevSettings = {
        debug: false
    };

    /**
     * Property required by the IDatasource interface of vscroll.
     * This defines the get method which retrieves the list of items
     * to render.
     */
    public readonly get: DatasourceGet<unknown>;

    constructor(
        public readonly httpClient: HttpClient,
        public readonly pagination: Pagination,
        public readonly settings: Settings<unknown> = {
            startIndex: 0,
            minIndex: 0,
            sizeStrategy: SizeStrategy.Frequent,
            // infinite: true
        }
    ) {
        if(!this.pagination.pageSize) this.pagination.pageSize = 30;

        this.get = (index, count) => new Promise((resolve, reject) => {
            const pageSize = this.pagination.pageSize;

            const startIndex = Math.max(index, 0);
            const endIndex = index + count - 1;

            if (startIndex > endIndex) {
                resolve([]); // empty result
                return;
            }

            const startPage = Math.floor(startIndex / pageSize);
            const endPage = Math.floor(endIndex / pageSize);

            const requests: Promise<DatasourceItem<T>[]>[] = [];
            for (let i = startPage; i <= endPage; i++) {
                requests.push(new Promise((resolve, reject) => {
                    this.fetchPage(new Pageable(i, pageSize)).pipe(takeUntil(this._destroy)).subscribe((items) => {
                        resolve(items);
                    });
                }));
            }

            Promise.all(requests).then((results) => {
                const items: DatasourceItem<T>[] = results.reduce((acc, result) => [...acc, ...result], []);

                const start = startIndex - startPage * pageSize;
                const end = start + endIndex - startIndex + 1;

                return items.slice(start, end);
            }).then((items) => {
                console.log(items);
                resolve(items);
            }).catch((error) => reject(error));

            // const page = Math.ceil((index / count));

            // console.log(index, count, page);

            // const pageable: IndexPageable = this.getPageableForIndex(index, count);

            // console.log("fetching... ", pageable);

            // if(this.hasFetched(pageIndex)) {
            //     console.log("already fetched");
            //     resolve(this.getPageOfCache(pageIndex));
            //     return;
            // }

            // this.fetchPage(pageable).pipe(takeUntil(this._destroy)).subscribe((items) => {
            //     console.log(items);
            //     resolve(items);
            // });

            // resolve([1,2,3]);
        });
    }

    protected fetchPage(pageable: Pageable): Observable<DatasourceItem<T>[]> {
        const pageIndex = pageable.page;
        // const pageIndex = pageable.page;

        // Check if page was already fetched or has invalid page settings.
        // if (pageIndex < 0 || pageable.size <= 0 || this._fetchedPageIndexes.has(pageIndex) || this._fetchedPageStatus[pageIndex] == PageFetchStatus.OK) {
        //     return of([]);
        // }

        // Update status to fetching
        // this._fetchedPageStatus[pageIndex] = PageFetchStatus.FETCHING;

        if(this.isCached(pageIndex)) {
            console.log("page already in cache, returning from cache");
            return of(this.getCachedPage(pageIndex));
        }

        console.log("page not cached yet, fetching from remote...");

        return this.httpClient.get<Page<T>>(`${this.pagination.url}${pageable.toQuery()}`).pipe(
            apiResponse(),
            switchMap((response: ApiResponse<Page<T>>): Observable<DatasourceItem<T>[]> => {
                const page = response?.payload;

                // If there were errors, set status to error.
                // Then it can be retried later.
                if(response.error || page.size < pageable.limit) {
                    return of([]);
                }

                let items: DatasourceItem<T>[] = page.elements.map<DatasourceItem<T>>((_, i) => {
                    if(!page.elements[i]) return null;
                    const element = Object.assign({}, page.elements[i]);
                    return {
                        data: element,
                        index: (pageIndex * this.pagination.pageSize) + i
                    }
                });

                // Cache page
                this.cachedPages[pageIndex] = items;

                this._totalElements = page.totalElements;
                return of(items);
            })
        );
    }

    protected getPageableForIndex(index: number, size: number): IndexPageable {
        return new IndexPageable(index, size);
    }

    protected getIndexForPageAndItemIndex(pageNr: number, index: number): number {
        const amount = pageNr * this.pagination.pageSize;
        return amount + index;
    }

    protected isCached(pageIndex: number): boolean {
        return !!this.cachedPages[pageIndex];
    }

    protected getCachedPage(pageIndex: number): DatasourceItem<T>[] {
        return this.cachedPages[pageIndex];
    }
}