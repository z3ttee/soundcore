export class Page<T = any> {

    constructor(
        public readonly items: T[],
        public readonly totalSize: number,
        public readonly info: PageInfo
    ) {}

    public static of<T = any>(items: T[], totalSize?: number, pageable?: Pageable): Page<T> {
        return new Page(items, totalSize, { limit: pageable?.limit, offset: pageable?.offset });
    }

    public static empty<T = any>(limit?: number, offset?: number): Page<T> {
        return new Page([], 0, { limit: limit, offset: offset });
    }

}

export class Pageable implements PageInfo {

    public readonly offset: number;
    public readonly limit: number;

    constructor(page: number, size: number) {
        this.limit = Math.max(1, size);
        this.offset = Math.max(0, page) * this.limit;
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

}

export interface PageInfo {
    readonly offset: number;
    readonly limit: number;
}