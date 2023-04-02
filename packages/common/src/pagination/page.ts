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
    public readonly nextOffset: number = null;
    /**
     * Index of the previous page. Null, if start
     * of pagination reached
     */
    public readonly prevOffset: number = null;

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

            if(maxPageIndex > currentPageIndex) this.nextOffset =  info.offset + info.limit;
            if(currentPageIndex > 0) this.prevOffset = Math.max(0, info.offset - info.limit);
        }
    }

    public static of<T = any>(items: T[], totalSize: number, pageable?: Pageable): Page<T> {        
        return new Page(items, totalSize, { limit: pageable?.limit, offset: pageable?.offset, index: pageable?.index });
    }

    public static empty<T = any>(pageable?: Pageable): Page<T>;
    public static empty<T = any>(limitOrPageable?: number | Pageable, offset?: number): Page<T> {
        if(typeof limitOrPageable === "number") return new Page([], 0, { limit: limitOrPageable, offset: offset, index: Math.floor((Math.max(0, offset ?? 0) / Math.max(1, limitOrPageable ?? 0))) });
        return new Page([], 0, limitOrPageable?.toInfo());
    }

}

export class Pageable implements PageInfo {

    public readonly index: number;
    public readonly offset: number;
    public readonly limit: number;

    constructor(offset: number, size: number) {
        this.limit = Math.max(1, Math.min(50, size));
        this.offset = Math.max(0, offset);
        this.index = Math.floor(this.offset / this.limit);
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
        return `offset=${this.offset}&limit=${this.limit}`;
    }

    public toInfo(): PageInfo {
        return {
            index: this.index,
            offset: this.offset,
            limit: this.limit
        }
    }

}

export interface PageInfo {
    readonly index: number;
    readonly offset: number;
    readonly limit: number;
}