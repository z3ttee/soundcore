/**
 * Class to handle
 * page settings.
 */
export abstract class BasePageable {
    constructor(
        /**
         * Current page index.
         * Should begin at 0 as it is directly
         * used in offset() or skip() calls on typeorm
         * queries.
         */
        public readonly offset: number,
        /**
         * Size of the page.
         * Must be at least 1 and at most 50
         */
        public readonly limit: number
    ){}

    abstract toQuery(): string;
    abstract toParams(): string;
}

export class Pageable extends BasePageable {
    constructor(
        /**
         * Current page index.
         * Should begin at 0 as it is directly
         * used in offset() or skip() calls on typeorm
         * queries.
         */
        public readonly page: number,
        /**
         * Size of the page.
         * Must be at least 1 and at most 50
         */
        size: number
    ){
        super(page * size, size);
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
        return `page=${this.page}&size=${this.limit}`;
    }

    public static queryOf(page: number, size: number) {
        return new Pageable(page, size).toQuery();
    }

    public static paramsOf(page: number, size: number) {
        return new Pageable(page, size).toParams();
    }
}

export class IndexPageable extends BasePageable {
    
    constructor(
        /**
         * Current page index.
         * Should begin at 0 as it is directly
         * used in offset() or skip() calls on typeorm
         * queries.
         */
        offset: number,
        /**
         * Size of the page.
         * Must be at least 1 and at most 50
         */
        size: number
    ){
        super(offset, size);
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
        return `offset=${this.offset}&size=${this.limit}`;
    }

    public static queryOf(page: number, size: number) {
        return new Pageable(page, size).toQuery();
    }

    public static paramsOf(page: number, size: number) {
        return new Pageable(page, size).toParams();
    }
}