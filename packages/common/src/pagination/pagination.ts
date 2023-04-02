import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Pageable } from "./page";

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
 * NOTE: This is only available on NodeJS environments
 * 
 * @param defaults Default page settings if some values are missing in url query
 * @returns Pageable - Page settings object
 */
export const Pagination = createParamDecorator(
    (defaults: { index: number, limit: number, offset: number }, ctx: ExecutionContext): Pageable => {        
        const request = ctx.switchToHttp().getRequest();

        let offset = parseInt(request.query?.offset) ?? defaults?.offset ?? 0;
        let limit = parseInt(request.query?.limit) ?? defaults?.limit ?? 50;

        return new Pageable(offset, limit);
    }
);