import { isNull } from "../utils/utilities";

export class Page<T = any> {
    /**
     * Amount of items on the current page
     */
    public readonly length: number = 0;
    /**
     * Index of the next page. Null, if end
     * of pagination reached
     */
    public readonly next: number = null;
    /**
     * Index of the previous page. Null, if start
     * of pagination reached
     */
    public readonly prev: number = null;

    constructor(
        /**
         * List of items on the page
         */
        public readonly items: T[],
        /**
         * Amount of items that are available in total
         */
        public readonly totalSize: number,
        public readonly info: PageInfo
    ) {
        this.length = items?.length ?? 0;

        if(!isNull(info?.limit) && !isNull(info?.offset)) {
            const maxPageIndex = Math.floor(totalSize / info.limit);
            const currentPageIndex = Math.floor(info.offset/info.limit);

            this.next = currentPageIndex >= maxPageIndex ? null : currentPageIndex + 1;
            this.prev = currentPageIndex <= 0 ? null : currentPageIndex - 1;
        }
    }

    public static of<T = any>(items: T[], totalSize: number, pageable?: Pageable): Page<T> {        
        return new Page(items, totalSize, { limit: pageable?.limit, offset: pageable?.offset, index: pageable?.index });
    }

    public static empty<T = any>(index?: number, limit?: number, offset?: number): Page<T> {
        return new Page([], 0, { limit: limit, offset: offset, index: index });
    }

}

export class Pageable implements PageInfo {

    public readonly index: number;
    public readonly offset: number;
    public readonly limit: number;

    constructor(page: number, size: number) {
        this.index = Math.max(0, page);
        this.limit = Math.max(1, size);
        this.offset = this.index * this.limit;
    }

    /**
     * Get the url query string with leading "?"
     * @returns string
     */
    public toQuery(): string {
        return `?${this.toParams()}`;
    }

    /**
     * Get the url query string without leading "?"
     * @returns string
     */
    public toParams(): string {
        return `page=${this.index}&limit=${this.limit}`;
    }

}

export interface PageInfo {
    readonly index: number;
    readonly offset: number;
    readonly limit: number;
}