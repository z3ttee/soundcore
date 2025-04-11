import { computed, Directive, signal } from "@angular/core";
import { Subject } from "rxjs";

export type ScPaginatorEvent = {
    readonly pageIndex: number;
    readonly pageSize: number;
}

@Directive()
export abstract class ScPaginatorBase {
    /** Subject to fire page events */
    private readonly _pageEvent = new Subject<ScPaginatorEvent>();
    /** Internal signal to manipulate active page index */
    private readonly _activePageIndex = signal<number>(0);

    /** Currently active page index */
    public readonly activePageIndex = computed(() => this._activePageIndex());
    /** Number of total items available */
    public readonly length = signal<number>(0);
    /** Currently selected page size */
    public readonly pageSize = signal<number>(50);
    /** Subscribe to page change events */
    public readonly pageChange = this._pageEvent.asObservable();

    /**
     * Angular Signal that holds the
     * maximum page index as number value
     */
    protected readonly maxPageIndex = computed(() => {
        const total = this.length();
        const size = Math.max(1, this.pageSize());
        const pages = Math.ceil(total / size) ?? 0;

        // If total size equals the page size,
        // then there are no more items than the first
        // page can serve
        if (total <= size) return 0;

        return Math.max(0, pages - 1);
    });

    /**
     * Select page by its index
     * @param pageIndex Index of the page to set as active
     */
    public selectPage(pageIndex: number): void {
        const newIndex = Math.max(0, Math.min(this.maxPageIndex(), pageIndex));
        this._activePageIndex.set(newIndex);
        this._pageEvent.next({
            pageIndex: newIndex,
            pageSize: this.pageSize(),
        });
    }

    /** Go to next page */
    public nextPage(): void {
        this.selectPage(this._activePageIndex() + 1);
    }

    /** Go to previous page */
    public previousPage(): void {
        this.selectPage(this._activePageIndex() - 1);
    }

    /**
     * Select first page
     */
    public firstPage(): void {
        this.selectPage(0);
    }

    /**
     * Select last page
     */
    public lastPage(): void {
        this.selectPage(this.maxPageIndex());
    }

    public setLength(length: number): void {
        this.length.set(length);
    }
}
