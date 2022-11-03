import { IAdapter, IDatasource, SizeStrategy } from "ngx-ui-scroll";
import { DatasourceGet, Settings, DevSettings } from "vscroll/dist/typings/interfaces";
import { v4 as uuidv4 } from "uuid";
import { catchError, Observable, of, Subject, switchMap, takeUntil } from "rxjs";
import { DatasourceItem } from "./datasource-item.entity";
import { ApiResponse, apiResponse, Page, Pageable } from "@soundcore/sdk";
import { Pagination } from "../config/datasource-pagination";
import { HttpClient } from "@angular/common/http";

export abstract class SCNGXBaseDatasource<T = any> implements IDatasource {
    /**
     * Unique identifier of the datasource.
     * Format: UUIDv4
     */
    public readonly id: string = uuidv4();

    /**
     * Map that holds all fetched pages.
     * Keys are page index and values are Datasource items.
     */
    private readonly _cachedPages: Map<number, DatasourceItem<T>[]> = new Map();

    /**
     * Subject used to trigger destroying the datasource.
     * Once the subject emits, the resources of the datasource are freed
     * and the datasource gets closed.
     */
    protected readonly _destroy: Subject<void> = new Subject();

    /**
     * Property required by the IDatasource interface of vscroll
     * Currently unused.
     */
    public readonly adapter?: IAdapter<unknown>;

    /**
     * Property required by the IDatasource interface of vscroll
     * Currently unused.
     */
    public readonly devSettings?: DevSettings;

    /**
     * Property required by the IDatasource interface of vscroll.
     * This defines the get method which retrieves the list of items
     * to render.
     */
    public readonly get: DatasourceGet<unknown>;

    /**
     * VScroll specific settings.
     */
    public readonly settings: Settings<unknown>;

    protected readonly pageSize: number = 30;

    constructor(
        pageSize: number = 30,
        settings: Settings<unknown> = {},
        devSettings: DevSettings = {}
    ) {
        // Set settings
        this.settings = {
            startIndex: 0,
            minIndex: 0,
            sizeStrategy: SizeStrategy.Frequent,
            bufferSize: 20,
            ...settings,
        }

        // Set devSettings
        this.devSettings = {
            debug: false,
            ...devSettings
        }

        // Set pageSize
        this.pageSize = pageSize || 30;

        // Register the get() method for vscroll's datasource
        this.get = (index, count) => new Promise((resolve, reject) => {
            const pageSize = this.pageSize;

            // Calculate requested indices
            const startIndex = Math.max(index, 0);
            const endIndex = index + count - 1;

            // If start greater than end, return empty array
            if (startIndex > endIndex) {
                resolve([]); // empty result
                return;
            }

            // Calculate pages needed
            const startPage = Math.floor(startIndex / pageSize);
            const endPage = Math.floor(endIndex / pageSize);

            const requests: Promise<DatasourceItem<T>[]>[] = [];
            for (let pageIndex = startPage; pageIndex <= endPage; pageIndex++) {

                // Directly add cached data to the requests
                if(this.isCached(pageIndex)) {
                    requests.push(new Promise((resolve) => {
                        resolve(this.getCachedPage(pageIndex));
                    }))
                    continue;
                }

                // Otherwise push network call promise to the requests array
                requests.push(new Promise((resolve, reject) => {
                    const pageable: Pageable = new Pageable(pageIndex, pageSize);
                    this.getPageData(pageable).pipe(takeUntil(this._destroy), catchError((err: Error) => {
                        reject(err)
                        return of([] as T[]);
                    })).subscribe((items) => {

                        // Map to internal datasource items
                        const mappedItems = items.map<DatasourceItem<T>>((_, i) => {
                            if(!items[i]) return null;

                            const element = Object.assign({}, items[i]);
                            return {
                                data: element,
                                index: (pageIndex * this.pageSize) + i
                            }
                        });

                        if(!!items) {
                            this.setCachedPage(pageIndex, mappedItems);
                        }

                        // Resolve with the items
                        resolve(mappedItems);
                    });
                }));
            }

            // Await all promises created above
            Promise.all(requests).then((results) => {
                // Flatten out the pages and gather all items in one array
                const items: DatasourceItem<T>[] = results.reduce((acc, result) => [...acc, ...result], []);

                // Calculate requested start and end indexes
                const start = startIndex - startPage * pageSize;
                const end = start + endIndex - startIndex + 1;

                // Slice the array to return just the requested resources
                return items.slice(start, end);
            }).then((items) => {
                console.log(items);
                resolve(items);
            }).catch((error) => reject(error));
        });
    }

    /**
     * Request a page from a different source (e.g. remote REST API).
     * Returned values are always stored in the internal cache and are resolved
     * before this function is called. So there is no need for manual caching.
     * @param pageable Page settings
     */
    protected abstract getPageData(pageable: Pageable): Observable<T[]>;

    /**
     * Set a cached page's contents
     * @param pageIndex Page index to cache
     * @param items Items to insert to cache
     */
    protected setCachedPage(pageIndex: number, items: DatasourceItem<T>[]) {
        this._cachedPages.set(pageIndex, items);
    }

    /**
     * Check if a page already exists in cache by its index.
     * @param pageIndex Index of the requested page to check
     * @returns True or False
     */
    protected isCached(pageIndex: number): boolean {
        return this._cachedPages.has(pageIndex);
    }

    /**
     * Get the datasource items from the cache matching a pageIndex.
     * @param pageIndex Index of the requested page to lookup from cache
     * @returns DatasourceItem<T>[]
     */
    protected getCachedPage(pageIndex: number): DatasourceItem<T>[] {
        return this._cachedPages.get(pageIndex);
    }

    /**
     * Clear internal cache.
     * This is useful if the contents should be refetched after updates occured.
     * When the user scrolls again, the pages get refetched.
     */
    public clearCache() {
        this._cachedPages.clear();
    }
}

export class SCNGXDatasource<T = any> extends SCNGXBaseDatasource<T> {
    
    constructor(
        public readonly httpClient: HttpClient,
        public readonly pagination: Pagination,
        settings?: Settings<unknown>
    ) {
        super(pagination.pageSize, settings);
    }

    /**
     * Get the datasource items from the cache matching a pageIndex.
     * @param pageIndex Index of the requested page to lookup from cache
     * @returns DatasourceItem<T>[]
     */
    protected getPageData(pageable: Pageable): Observable<T[]> {
        const pageIndex = pageable.page;

        // Make network call
        return this.httpClient.get<Page<T>>(`${this.pagination.url}${pageable.toQuery()}`).pipe(
            // Transform errors
            apiResponse(),
            // Intercept the response and switch to different observable type
            switchMap((response: ApiResponse<Page<T>>): Observable<T[]> => {
                const page = response?.payload;

                // If there were errors, set status to error.
                // Then it can be retried later.
                if(response.error || page.size < pageable.limit) {
                    return of([]);
                }

                // Map the results to internal 
                let items: DatasourceItem<T>[] = page.elements.map<DatasourceItem<T>>((_, i) => {
                    if(!page.elements[i]) return null;
                    const element = Object.assign({}, page.elements[i]);
                    return {
                        data: element,
                        index: (pageIndex * this.pagination.pageSize) + i
                    }
                });

                return of(page.elements);
            })
        );
    }
}