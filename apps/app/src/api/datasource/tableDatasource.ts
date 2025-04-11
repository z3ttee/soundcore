import { DataSource } from "@angular/cdk/collections";
import { computed, effect, signal, Signal } from "@angular/core";
import { Future, FutureError, Page, Pageable } from "@repo/utilities";
import { map, Observable, startWith, Subject, Subscription, switchMap, takeUntil, tap } from "rxjs";
import { ScPaginator } from "src/app/components/v2/paginator/api/paginator";

type TableDataSourceRequestFn<T> = (pageable: Pageable) => Observable<Future<Page<T>>>

export type TableDataSourceItem<T> = {
    loading: boolean;
    error: FutureError | null;
    data: T | null;
}

export type TableDataSourceHandler<T> = {
    request: TableDataSourceRequestFn<T>;
    paginator: Signal<ScPaginator>;
}

/**
 * Create a new instance of a datasource
 * @param notifier Notify handler to register a paginator and request function
 */
export function tableDatasource<T>(handler: TableDataSourceHandler<T>) {
    return new ApiTableDatasource<T>(handler.request, handler.paginator);
}

export class ApiTableDatasource<TData> extends DataSource<TableDataSourceItem<TData>> {
    private readonly _destroy = new Subject<void>();

    private readonly _loading = signal(false);
    private readonly _error = signal<FutureError | null>(null);

    /** Currently connected instance to the paginator */
    private _paginatorInstance?: ScPaginator = undefined;
    /** Internal subscription to manage change of connected paginator */
    private _paginatorSub?: Subscription = undefined;
    /** Subject to emit page change events internally */
    private readonly _pageChange = new Subject<Pageable>();

    /** Check loading state of the datasource */
    public readonly isLoading = this._loading.asReadonly();
    /** Check if the datasource has errored on a request */
    public readonly hasError = computed(() => !!this._error());
    /** Get the error object if any */
    public readonly lastError = computed(() => this._error());

    constructor(
        private readonly _request: TableDataSourceRequestFn<TData>,
        private readonly _paginator: Signal<ScPaginator>,
    ) {
        super();
        effect(() => {
            // Whenever paginator instance changes, we
            // want to register it and remove old instance
            this._setupPaginator(this._paginator());
        });
    }

    override connect(): Observable<readonly TableDataSourceItem<TData>[]> {
        return this._pageChange.pipe(
            takeUntil(this._destroy),
            startWith(new Pageable(0, this._paginatorInstance.pageSize())),
            switchMap((pageable) => {
                return this._request(pageable).pipe(
                    tap((future) => {
                        if (!future.loading && !future.error) {
                            this._updatePaginatorOptions(future.data);
                        }
                    }),
                    map((future): TableDataSourceItem<TData>[] => {
                        this._loading.set(future.loading);
                        this._error.set(future.error);

                        // When the request is still loading, we want to show a loading state
                        if (future.loading) {
                            return Array.from<TableDataSourceItem<TData>>({ length: pageable.limit }).fill({
                                loading: true,
                                error: null,
                                data: null
                            });
                        }

                        // When there has been an error, we want to show the error
                        if (future.error) {
                            return Array.from<TableDataSourceItem<TData>>({ length: pageable.limit }).fill({
                                loading: false,
                                error: future.error,
                                data: null
                            });
                        }

                        return (future.data?.items ?? []).map((item) => ({
                            loading: false,
                            error: null,
                            data: item
                        }));
                    })
                );
            }));
    }

    override disconnect(): void {
        this._destroy.next();
        this._destroy.complete();
    }

    private _setupPaginator(paginator: ScPaginator) {
        if (this._paginatorSub) {
            this._paginatorSub.unsubscribe();
            this._paginatorSub = undefined;
            this._paginatorInstance = undefined;
        }

        this._paginatorInstance = paginator;
        this._paginatorSub = paginator.pageChange.pipe(takeUntil(this._destroy)).subscribe((event) => {
            this._pageChange.next(new Pageable(event.pageIndex * event.pageSize, event.pageSize));
        });
    }

    private _updatePaginatorOptions(page: Page) {
        if (!this._paginatorInstance) {
            return;
        }

        // this._paginatorInstance.pageIndex = Math.floor(pageable.offset / pageable.limit);
        // this._paginatorInstance.pageSize = pageable.limit;
        this._paginatorInstance.length.set(page.totalSize);
    }

}
