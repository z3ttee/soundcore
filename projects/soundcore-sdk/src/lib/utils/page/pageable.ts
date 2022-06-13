/**
 * Class to handle
 * page settings.
 */
export class Pageable {
    constructor(
        /**
         * Current page index.
         * Should begin at 0 as it is directly
         * used in offset() or skip() calls on typeorm
         * queries.
         */
        public page: number,
        /**
         * Size of the page.
         * Must be at least 1 and at most 50
         */
        public size: number
    ){}

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
        return `page=${this.page}&size=${this.size}`;
    }

    public static queryOf(page: number, size: number) {
        return new Pageable(page, size).toQuery();
    }

    public static paramsOf(page: number, size: number) {
        return new Pageable(page, size).toParams();
    }
}