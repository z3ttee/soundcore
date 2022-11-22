import { Datasource, SizeStrategy } from "ngx-ui-scroll";
import { Settings, DevSettings, ItemsPredicate } from "vscroll/dist/typings/interfaces";
import { v4 as uuidv4 } from "uuid";
import { BehaviorSubject, catchError, filter, map, Observable, of, Subject, takeUntil } from "rxjs";
import { Pageable } from "@soundcore/sdk";
import { PageCache } from "./page-cache.entity";

export const DEFAULT_PAGE_SIZE = 20;

export interface AdapterAppendOptions<T = any> {
    items: T[];
    eof?: boolean;
    decrease?: boolean;
}

export interface AdapterPrependOptions<T = any> {
    items: T[];
    bof?: boolean;
    increase?: boolean;
}

export interface AdapterReplaceOptions<T = any> {
    predicate: ItemsPredicate;
    items: T[];
    fixRight?: boolean;
}

export interface AdapterRemoveOptions {
    predicate?: ItemsPredicate;
    indexes?: number[];
    increase?: boolean;
}

export abstract class SCNGXBaseDatasource<T = any> extends Datasource {

    /**
     * Unique identifier of the datasource.
     * Format: UUIDv4
     */
    public readonly id: string = uuidv4();

    /**
     * Map that holds all fetched pages.
     * Keys are page index and values are Datasource items.
     */
    private readonly _cache: PageCache<T>;

    /**
     * Subject used to trigger destroying the datasource.
     * Once the subject emits, the resources of the datasource are freed
     * and the datasource gets closed.
     */
    protected readonly _destroy: Subject<void> = new Subject();

    /**
     * Subject used to inform subscribers on errors that occured inside the datasource
     */
    private readonly _errorSubject: Subject<Error> = new Subject();

    /**
     * Observable to which subscribers can be subscribed. Used to act upon
     * errors inside the datasource.
     */
    public readonly $error: Observable<Error> = this._errorSubject.asObservable();

    private _size: number = 0;
    public get size(): number {
        return this._size;
    }

    private readonly _readySubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public readonly $ready: Observable<boolean> = this._readySubject.asObservable();

    private readonly _sizeSubject: BehaviorSubject<number> = new BehaviorSubject(this._size);
    public readonly $size: Observable<number> = this.$ready.pipe(filter((rdy) => rdy), map(() => this._size));

    protected readonly pageSize: number = DEFAULT_PAGE_SIZE;

    constructor(
        pageSize: number = DEFAULT_PAGE_SIZE,
        items?: T[],
        settings: Settings<unknown> = {},
        devSettings: DevSettings = {}
    ) {
        super({
            settings: {
                startIndex: 0,
                minIndex: 0,
                sizeStrategy: SizeStrategy.Frequent,
                bufferSize: pageSize ?? DEFAULT_PAGE_SIZE,
                ...settings,
            },
            devSettings: {
                debug: false,
                ...devSettings
            },
            get: (index, count) => new Promise((getResolve, getReject) => {
                const size = pageSize ?? DEFAULT_PAGE_SIZE;
    
                // Calculate requested indices
                const startIndex = Math.max(index, 0);
                const endIndex = index + count - 1;
    
                // If start greater than end, return empty array
                if (startIndex > endIndex) {
                    getResolve([]); // empty result
                    return;
                }
    
                // Calculate pages needed
                const startPage = Math.floor(startIndex / size);
                const endPage = Math.floor(endIndex / size);
    
                const requests: Promise<T[]>[] = [];
                for (let pageIndex = startPage; pageIndex <= endPage; pageIndex++) {
    
                    // Directly add cached data to the requests
                    if(this.isCached(pageIndex)) {
                        requests.push(new Promise(async (requestResolve) => {
                            requestResolve(await this.getCachedPage(pageIndex));
                        }))
                        continue;
                    }
    
                    // Otherwise push network call promise to the requests array
                    requests.push(new Promise((requestResolve, requestReject) => {
                        const pageable: Pageable = new Pageable(pageIndex, size);
                        
                        this.getPageData(pageable).pipe(takeUntil(this._destroy), catchError((err: Error) => {
                            this.pushError(err);
                            requestReject(err)
                            return of([] as T[]);
                        })).subscribe((items) => {
    
                            // Map to internal datasource items
                            const mappedItems = items.map<T>((_, i) => {
                                if(!items[i]) return null;
    
                                const element = Object.assign({}, items[i]);
                                return element;
                            });
    
                            if(!!items) {
                                this.setCachedPage(pageIndex, mappedItems);
                            }
    
                            // Resolve with the items
                            requestResolve(mappedItems);
                        });
                    }));
                }
    
                // Await all promises created above
                Promise.all(requests).then((results) => {
                    // Flatten out the pages and gather all items in one array
                    const items: T[] = results.reduce((acc, result) => [...acc, ...result], []);
    
                    // Calculate requested start and end indexes
                    const start = startIndex - startPage * pageSize;
                    const end = start + endIndex - startIndex + 1;
    
                    // Slice the array to return just the requested resources
                    return items.slice(start, end);
                }).then((items) => {
                    getResolve(items);
                }).catch((error: Error) => {
                    this.pushError(error);
                    getReject(error);
                }).finally(() => {
                    // First request has happened, set ready to true
                    this.setReady(true);  
                });
            })
        })

        this.pageSize = pageSize ?? DEFAULT_PAGE_SIZE;
        this._cache = new PageCache(this.pageSize, items);
    }

    /**
     * Add an item to the bottom of the datasource list
     * @param item Item to append
     */
    public async append(item: T) {
        return this._cache.append(item).then(async () => {
            await this.relax();
            return this.adapter.append({
                items: [ item ]
            } as AdapterAppendOptions<T>).then((result) => {
                // Increment datasource size on success
                if(result.success) this.incrementSize();
                return result;
            });
        });
    }

    /**
     * Add an item to the top of the datasource list.
     * @param item Item to prepend
     */
    public async prepend(item: T) {
        return this._cache.prepend(item).then(async () => {
            await this.relax();
            return this.adapter.append({
                items: [ item ]
            } as AdapterPrependOptions<T>).then((result) => {
                // Increment datasource size on success
                if(result.success) this.incrementSize();
                return result;
            });
        });
    }

    /**
     * Replace an item in the datasource list.
     * @param index Index to replace at
     * @param item Item to replace
     */
    public async replace(index: number, item: T) {
        return this._cache.replaceAt(index, item).then(async () => {
            await this.relax();
            return this.adapter.replace({
                predicate: ({ $index }) => index == $index,
                items: [ item ]
            });
        });
    }

    /**
     * Replace an item in the datasource list.
     * @param id ID to replace at
     * @param item Item to replace
     */
    public async replaceById(id: string, item: T) {
        return this._cache.replaceAtId(id, item).then(async () => {
            await this.relax();
            return this.adapter.replace({
                predicate: ({ data }) => data["id"] === id,
                items: [ item ]
            });
        });
    }

    /**
     * Append an item to the datasource. If the item's id is already known,
     * it will be replaced instead
     * @param data Data to append or replace
     */
    public async appendOrReplace(data: T) {
        return this._cache.appendOrReplace(data).then(async ({ wasAppended, item }) => {
            await this.relax();
            
            if(wasAppended) {
                // Append to datasource
                return this.adapter.append({ items: [ item.data ] }).then((result) => {
                    // Increment datasource size on success
                    if(result.success) this.incrementSize();
                    return result;
                });
            } else {
                // Otherwise replace
                return this.adapter.replace({
                    predicate: ({ data }) => data["id"] === item.id,
                    items: [ item.data ]
                });
            }
        })
    }

    /**
     * Remove an item from the datasource list.
     * @param index Index to remove
     */
    public async remove(index: number) {
        return this._cache.removeByIndex(index).then(async () => {
            await this.relax();
            return this.adapter.remove({
                indexes: [ index ]
            }).then((result) => {
                // Decrement datasource size on success
                // Immediate is false, if no items were deleted
                if(result.success && !result.immediate) {
                    this.decrementSize();
                }
                return result;
            });
        });
    }

    /**
     * Remove an item from the datasource list.
     * @param id ID to remove
     */
    public async removeById(id: string) {
        return this._cache.removeById(id).then(async () => {
            await this.relax();
            return this.adapter.remove({
                predicate: ({ data }) => data["id"] === id
            }).then((result) => {
                // Decrement datasource size on success
                // Immediate is false, if no items were deleted
                if(result.success && !result.immediate) {
                    this.decrementSize();
                }
                return result;
            });
        });
    }

    /**
     * Reload the datalist buffer.
     * @param index Index to reload at. If omitted, datalist reloads at currently first visible index
     */
    public async reload(index?: number) {
        index = index ?? this.adapter.firstVisible?.$index ?? 0;

        await this.relax();
        return this.adapter.reload(index);
    }

    public async relax() {
        return this.adapter.relax();
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
    protected setCachedPage(pageIndex: number, items: T[]) {
        this._cache.setPage(pageIndex, items);
        this.incrementSize(items.length);
    }

    /**
     * Check if a page already exists in cache by its index.
     * @param pageIndex Index of the requested page to check
     * @returns True or False
     */
    protected isCached(pageIndex: number): boolean {
        return this._cache.hasPage(pageIndex);
    }

    /**
     * Get the datasource items from the cache matching a pageIndex.
     * @param pageIndex Index of the requested page to lookup from cache
     * @returns DatasourceItem<T>[]
     */
    protected async getCachedPage(pageIndex: number): Promise<T[]> {
        return this._cache.getPage(pageIndex);
    }

    /**
     * Clear internal cache.
     * This is useful if the contents should be refetched after updates occured.
     * When the user scrolls again, the pages get refetched.
     */
    public clearCache() {
        this._cache.clear();
    }

    /**
     * Emit a new error. Subscribers can act upon this error.
     * Use this to inform your frontend parts on errors.
     * @param error Error to push
     */
    protected pushError(error: Error): void {
        this._errorSubject.next(error);
    }

    /**
     * Translate an items index in the tracklist to
     * its associated page index.
     * @param index Index of the item
     * @returns Page index as number
     */
    protected translateIndexToPageIndex(index: number): number {
        const startIndex = Math.max(index, 0);
        const startPage = Math.floor(startIndex / this.pageSize);

        return startPage;
    }

    protected setSize(size: number) {
        if(size < 0) size = 0;
        if(this._size == size) return;

        console.log("updating datasource size")

        this._size = size;
        this._sizeSubject.next(this._size);
    }

    protected incrementSize(inc: number = 1) {
        this.setSize(this._size + inc);
    }

    protected decrementSize(dec: number = 1) {
        this.setSize(this._size - dec);
    }

    /**
     * Set the ready state for the datasource.
     * This should be set to true, if the first request happened.
     * @param ready Ready state
     */
    private setReady(ready: boolean) {
        if(this._readySubject.getValue() == ready) return;
        this._readySubject.next(ready);
    }
}