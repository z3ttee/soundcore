import { isNull } from "../utils/utilities";

export class Page<T = any> {
    public readonly length: number = 0;

    constructor(
        public readonly next: number,
        public readonly items: T[],
        public readonly totalSize: number,
        public readonly info: PageInfo
    ) {
        this.length = items?.length ?? 0;
    }

    public static of<T = any>(items: T[], totalSize: number, pageable?: Pageable): Page<T> {
        let next: number = null;
        
        if(!isNull(pageable)) {
            const maxPages = Math.floor(totalSize / pageable.limit);
            next = pageable.index < maxPages ? pageable.index + 1 : null;
        }
        
        return new Page(next, items, totalSize, { limit: pageable?.limit, offset: pageable?.offset, index: pageable?.index });
    }

    public static empty<T = any>(index?: number, limit?: number, offset?: number): Page<T> {
        return new Page(null, [], 0, { limit: limit, offset: offset, index: index });
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