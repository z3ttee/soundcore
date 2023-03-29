import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { BehaviorSubject, catchError, combineLatest, filter, map, Observable, of, startWith, Subject, Subscription, takeUntil } from "rxjs";

export abstract class SCSDKBaseDatasource<T = any> extends DataSource<T> {
    protected subscription = new Subscription();
    protected cachedData?: T[] = Array.from({ length: this.initialSize });
    protected dataStream = new BehaviorSubject<(T | undefined)[]>(this.cachedData ?? []);
    private fetchedPages = new Set<number>();

    protected _totalSize: number = 1;

    private readonly _destroy: Subject<void> = new Subject();
    private readonly _readySubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private readonly _errorSubject: Subject<Error> = new Subject();
    private readonly _totalSizeSubject: Subject<number> = new Subject();

    /**
     * Emits ready state. A datasource is considered ready, after the 
     * first page was fetched
     */
    public readonly $ready: Observable<boolean> = this._readySubject.asObservable();
    /**
     * Emit errors during fetching processes
     */
    public readonly $error: Observable<Error> = this._errorSubject.asObservable();
    /**
     * Emits the destroy event to notify all subscribers 
     * that the datasource wants to be destroyed
     */
    public readonly $destroyed: Observable<void> = this._destroy.asObservable();
    /**
     * Emits the total size of the datasource (including items that are
     * not fetched yet)
     */
    public readonly $totalSize: Observable<number> = this._totalSizeSubject.asObservable();
    /**
     * Emits the empty state of the datasource
     */
    public readonly $empty: Observable<boolean> = combineLatest([ 
        this.$ready.pipe(filter((isReady) => isReady), startWith(false), takeUntil(this._destroy)),  
        this.$totalSize.pipe(takeUntil(this._destroy))
    ]).pipe(map(([_, totalSize]) => totalSize <= 0));

    constructor(
        protected readonly pageSize: number = 30,
        protected readonly initialSize: number = pageSize,
        protected readonly primaryKey: (keyof T) = "id" as (keyof T)
    ) {
        super();

        this.$destroyed.subscribe(() => {
            this.subscription.unsubscribe();

            this._readySubject.complete();
            this._errorSubject.complete();
            this._totalSizeSubject.complete();
        });
    }

    /**
     * Fetch a page of elements for a page index
     * @param pageIndex Page index
     * @returns Page of elements
     */
    protected abstract fetchPage(pageIndex: number): Observable<T[]>;

    public get ready(): boolean {
        return this._readySubject.getValue();
    }

    public connect(collectionViewer: CollectionViewer): Observable<readonly T[]> {
        this.subscription.add(collectionViewer.viewChange.pipe(takeUntil(this._destroy)).subscribe((range) => {
            const startPage = this.getPageForIndex(range.start);
            const endPage = this.getPageForIndex(range.end);
    
            for (let pageIndex = startPage; pageIndex <= endPage; pageIndex++) {
                if (this.hasPage(pageIndex)) {
                    continue;
                }

                this.fetchPage(pageIndex).pipe(
                    takeUntil(this._destroy),
                    catchError((err: Error) => {
                        console.error(err);
                        this._errorSubject.next(err);
                        return of(null);
                    })
                ).subscribe((items) => {
                    if(!this.ready) this.setReady(true);
                    if(typeof items === "undefined" || items == null) return;
    
                    // Add page index to fetched set
                    // to track fetched pages
                    this.fetchedPages.add(pageIndex);
    
                    // if(items.length <= 0) return;
                    // Add fetched items to cachedData
                    this.cachedData.splice(pageIndex * this.pageSize, this.pageSize, ...Array.from({length: items.length}).map((_, i) => items[i]));
                    // Push updated cache to stream
                    this.dataStream.next(this.cachedData);
                });
            }
        }));

        return this.dataStream;
    }

    /**
     * Disconnect the datasource to release resources.
     * This will trigger the destroy mechanism
     */
    public disconnect(_: CollectionViewer): void {
        this.destroy();
    }

    /**
     * Check if a page by an index is already cached.
     * If true, the page was already fetched.
     * @param pageIndex Index of the page
     * @returns True or False
     */
    protected hasPage(pageIndex: number): boolean {
        return this.fetchedPages.has(pageIndex) && this.cachedData.length >= (Math.max(1, pageIndex) * this.pageSize);
    }

    /**
     * Convert and item index to a page index
     * @param index Item index
     * @returns Page index
     */
    protected getPageForIndex(index: number): number {
        return Math.floor(index / this.pageSize);
    }

    protected setReady(ready: boolean) {
        this._readySubject.next(ready);
    }

    /**
     * Trigger destroy mechanism. This will publish
     * a destroy event on the destroy subject
     */
    protected destroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    protected setTotalSize(size: number) {
        if(this._totalSize <= 0) size = 0;
        this._totalSize = size;

        this._totalSizeSubject.next(this._totalSize);
    }

    /**
     * Update an item in the datasource
     * @param item Source item
     * @param updated Updated data
     * @returns True, if the update was successful
     */
    public update(item: T, updated: T): boolean {
        const index = this.getIndexByItem(item);
        return this.updateByIndex(index, updated);
    }

    /**
     * Update an item in the datasource identified by its id.
     * This requires the objects to have an "id" property
     * @param id Id of the item
     * @param updated Updated data
     * @returns True, if the update was successful
     */
    public updateById(id: string, updated: T): boolean {
        const index = this.getIndexByItemId(id);
        return this.updateByIndex(index, updated);
    }

    /**
     * Update an item by its index in the datasource
     * @param index Index of the item
     * @param updated Updated data
     * @returns True, if the update was successful
     */
    private updateByIndex(index: number, updated: T): boolean {
        if(index == -1) return false;

        this.cachedData.splice(index, 1, updated);
        this.updateStream();

        return true;
    }

    /**
     * Update an item identified by its id if it exists. Otherwise the item will be appended.
     * @param id Id of the item
     * @param updated Data of the item
     * @returns True, if item was updated. Otherwise returns false if the item was appended instead
     */
    public updateOrAppendById(id: any, updated: T): boolean {
        const index = this.getIndexByItemId(id);
        if(index == -1) {
            this.append(updated);
            return false;
        }

        return this.updateByIndex(index, updated);
    }

    /**
     * Insert an item at the end of the datasource
     * @param item Data to add
     */
    public append(item: T) {
        // Add fetched items to cachedData

        // this.cachedData.splice(this._totalSize, 1, item);
        this.cachedData.push(item);
        this.setTotalSize(this._totalSize + 1);
        this.updateStream();
    }

    /**
     * Insert an item at the top of the datasource.
     * @param item Data to add
     */
    public prepend(item: T) {
        this.cachedData.unshift(item);
        this.setTotalSize(this._totalSize + 1);
        this.updateStream();
    }

    /**
     * Update an item by its id. If the item does not exist in the datasource,
     * the data is prepended.
     * @param id Id of the item
     * @param updated Updated data
     * @returns True, if the item was updated. If the item was prepended, it will return false
     */
    public updateOrPrependById(id: any, updated: T): boolean {
        const index = this.getIndexByItemId(id);
        if(index == -1) {
            this.prepend(updated);
            return false;
        }

        return this.updateByIndex(index, updated);
    }


    public appendMany(items: T[]) {
        // Add fetched items to cachedData
        this.cachedData.splice(this._totalSize, items.length, ...Array.from({length: items.length}).map((_, i) => items[i]));
        this.updateStream();

        this.setTotalSize(this._totalSize + items.length);
    }

    /**
     * Remove an item from the datasource.
     * Note: The object ref must be identical
     * @param item Item ref to delete
     */
    public remove(item: T) {
        this.cachedData = [...this.cachedData.filter((element) => element != item)];
        this.updateStream();
        this.setTotalSize(this._totalSize - 1);
    }

    /**
     * Remove an item by its id.
     * Note: The item must have an "id" property
     * @param id Id of the item
     */
    public removeById(id: any) {
        this.cachedData = [...this.cachedData.filter((element) => element?.[this.primaryKey] !== id)];
        this.updateStream();
        this.setTotalSize(this._totalSize - 1);
    }

    /**
     * Convert an item to its index in the datasource
     * @param item Item to lookup
     * @returns Index (-1 if the item does not exist)
     */
    public getIndexByItem(item: T): number {
        return this.cachedData.findIndex((element) => element == item);
    }

    /**
     * Get an item's index in the datasource by its id
     * @param id Id of the item
     * @returns Index (-1 if the item does not exist)
     */
    public getIndexByItemId(id: any): number {
        return this.cachedData.findIndex((element) => element?.[this.primaryKey] === id);
    }

    /**
     * Updated the datastream
     */
    protected updateStream() {
        // Push updated cache to stream
        this.dataStream.next(this.cachedData);
    }

    protected getPageOrFetch(pageIndex: number): Observable<T[]> {
        return new Observable((subscriber) => {
            if(this.hasPage(pageIndex)) {
                const pageStart = this.pageSize * pageIndex;
                const pageEnd = pageStart + this.pageSize; 

                // Note: Slice is exclusive the end param
                const elements = this.cachedData.slice(pageIndex * this.pageSize, pageEnd + 1);

                subscriber.next(elements);
                subscriber.complete();
                return;
            } 

            subscriber.add(this.fetchPage(pageIndex).pipe(catchError((err: Error) => {
                console.error(err);
                return of([]);
            })).subscribe((elements) => {
                subscriber.next(elements);
                subscriber.complete();
            }))
        });
    }

    protected calculatePageStart(pageIndex: number) {
        return this.pageSize * pageIndex;
    }

    protected calculatePageEnd(pageIndex: number) {
        return this.calculatePageStart(pageIndex) + this.pageSize;
    }

}