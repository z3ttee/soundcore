import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { HttpClient } from "@angular/common/http";
import { Page, Pageable, toFuture } from "@soundcore/sdk";
import { BehaviorSubject, catchError, combineLatest, filter, map, Observable, of, Subject, Subscription, takeUntil, tap } from "rxjs";

export type SCNGXDatasourceFreeHandler = () => boolean;

export abstract class SCNGXBaseDatasource<T = any> extends DataSource<T> {
    protected subscription = new Subscription();
    protected cachedData?: T[] = Array.from({ length: this.initialSize });
    protected dataStream = new BehaviorSubject<(T | undefined)[]>(this.cachedData ?? []);
    protected isConnected: boolean = false;
    private fetchedPages = new Set<number>();

    protected _totalSize: number = 1;

    private readonly _destroy: Subject<void> = new Subject();
    private readonly _readySubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private readonly _errorSubject: Subject<Error> = new Subject();
    private readonly _totalSizeSubject: Subject<number> = new Subject();

    public readonly $ready: Observable<boolean> = this._readySubject.asObservable();
    public readonly $error: Observable<Error> = this._errorSubject.asObservable();
    public readonly $destroyed: Observable<void> = this._destroy.asObservable();
    public readonly $totalSize: Observable<number> = this._totalSizeSubject.asObservable();
    public readonly $empty: Observable<boolean> = combineLatest([ 
        this.$ready.pipe(filter((isReady) => isReady), takeUntil(this._destroy)),  
        this.$totalSize.pipe(takeUntil(this._destroy))
    ]).pipe(map(([_, totalSize]) => totalSize <= 0));

    constructor(
        protected readonly pageSize: number = 30,
        protected readonly initialSize: number = 0
    ) {
        super();

        this.$destroyed.subscribe(() => {
            this.subscription.unsubscribe();

            this._readySubject.complete();
            this._errorSubject.complete();
            this._totalSizeSubject.complete();
        });
    }

    public get ready(): boolean {
        return this._readySubject.getValue();
    }

    public connect(collectionViewer: CollectionViewer): Observable<readonly T[]> {
        // Only connect if not connected already,
        // Otherwise just return initialized datastream
        if(!this.isConnected) {
            this.subscription.add(collectionViewer.viewChange.subscribe((range) => {
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
        }

        return this.dataStream;
    }

    public disconnect(_: CollectionViewer): void {
        this.destroy();
    }

    protected hasPage(pageIndex: number): boolean {
        return this.fetchedPages.has(pageIndex) && this.cachedData.length >= (Math.max(1, pageIndex) * this.pageSize);
    }

    protected setReady(ready: boolean) {
        this._readySubject.next(ready);
    }

    protected getPageForIndex(index: number): number {
        return Math.floor(index / this.pageSize);
    }

    protected destroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    protected setTotalSize(size: number) {
        if(this._totalSize <= 0) size = 0;
        this._totalSize = size;

        this._totalSizeSubject.next(this._totalSize);
    }

    protected abstract fetchPage(pageIndex: number): Observable<T[]>;

    public update(item: T, updated: T): boolean {
        const index = this.getIndexByItem(item);
        return this.updateByIndex(index, updated);
    }

    public updateById(id: string, updated: T): boolean {
        const index = this.getIndexByItemId(id);
        return this.updateByIndex(index, updated);
    }

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

    public append(item: T) {
        // Add fetched items to cachedData
        this.cachedData.splice(this._totalSize, 1, item);
        this.updateStream();

        this.setTotalSize(this._totalSize + 1);
    }

    public appendMany(items: T[]) {
        // Add fetched items to cachedData
        this.cachedData.splice(this._totalSize, items.length, ...Array.from({length: items.length}).map((_, i) => items[i]));
        this.updateStream();

        this.setTotalSize(this._totalSize + items.length);
    }

    public remove(item: T) {
        this.cachedData = [...this.cachedData.filter((element) => element !== item)];
        this.updateStream();
        this.setTotalSize(this._totalSize - 1);
    }

    public removeById(id: any) {
        this.cachedData = [...this.cachedData.filter((element) => element?.["id"] !== id)];
        this.updateStream();
        this.setTotalSize(this._totalSize - 1);
    }

    public getIndexByItem(item: T): number {
        return this.cachedData.findIndex((element) => element == item);
    }

    public getIndexByItemId(id: any): number {
        return this.cachedData.findIndex((element) => element?.["id"] === id);
    }

    protected updateStream() {
        // Push updated cache to stream
        this.dataStream.next(this.cachedData);
    }

    protected getPageOrFetch(pageIndex: number): Observable<T[]> {
        return new Observable((subscriber) => {
            if(this.hasPage(pageIndex)) {
                const elements = this.cachedData.slice(pageIndex * this.pageSize, this.pageSize);
                subscriber.next(elements);
                subscriber.complete();

                return;
            } 

            subscriber.add(this.fetchPage(pageIndex).pipe(catchError((err: Error) => {
                return of([]);
            })).subscribe((elements) => {
                subscriber.next(elements);
                subscriber.complete();
            }))
        });
    }

}

export class SCNGXDatasource<T = any> extends SCNGXBaseDatasource<T> {

    constructor(
        private readonly httpClient: HttpClient,
        private readonly pageableUrl: string,
        initialSize?: number,
        pageSize?: number
    ) {
        super(pageSize ?? 30, initialSize);
    }

    protected fetchPage(pageIndex: number): Observable<T[]> {
        const pageable = new Pageable(pageIndex, this.pageSize);

        if(typeof this.pageableUrl === "undefined" || this.pageableUrl == null) return of([]);
        return this.httpClient.get<Page<T>>(`${this.pageableUrl}${pageable.toQuery()}`).pipe(
            toFuture(),
            filter((request) => !request.loading),
            map((request) => {
                if(request.error) {
                    throw request.error;
                }

                // Get page data and return it
                const page = request.data ?? Page.of([], 0, 0);

                this.setTotalSize(page.totalElements);
                return page.elements;
            })
        );
    }
}