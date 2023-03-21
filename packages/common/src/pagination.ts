import { createParamDecorator, ExecutionContext } from "@nestjs/common";

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

/**
 * Pagination decorator to get page settings from
 * url on NestJS http requests.
 * If no value for "size" or "page" is set, it defaults
 * to size=50 or page=0.
 * You can overwrite those default values by passing a Pageable object
 * with custom values to the decorator.
 * 
 * NOTE: You cannot have page sizes of <= 0 or > 50. That means page sizes are always between
 * min. 1 and max. 50.
 * 
 * @param defaults Default page settings if some values are missing in url query
 * @returns Pageable - Page settings object
 */
export const Pagination = createParamDecorator(
    (defaults: { page: number, size: number }, ctx: ExecutionContext): Pageable => {        
        const request = ctx.switchToHttp().getRequest();

        let pageNr = parseInt(request.query?.page) || defaults?.page || 0;
        let pageSize = parseInt(request.query?.size) || defaults?.size || 50;

        return new Pageable(pageNr, pageSize);
    }
);