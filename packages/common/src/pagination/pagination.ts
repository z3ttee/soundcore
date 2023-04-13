import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Pageable } from "./page";
import { isNull } from "../utils";
import { MAX_PAGE_SIZE } from "../constants";

/**
 * Pagination decorator to get page settings from
 * url on NestJS http requests.
 * If no value for "limit" or "offset" is set, it defaults
 * to limit=30 and offset=0.
 * You can overwrite those default values by passing a Pageable object
 * with custom values to the decorator.
 * 
 * NOTE: You cannot have page sizes of <= 0 or > 30. That means page sizes are always between
 * min. 1 and max. 30.
 * 
 * NOTE: This is only available on NodeJS environments
 * 
 * @param defaults Default page settings if some values are missing in url query
 * @returns Pageable - Page settings object
 */
export const Pagination = createParamDecorator(
    (defaults: { limit?: number, offset?: number, maxLimit?: number }, ctx: ExecutionContext): Pageable => {        
        const request = ctx.switchToHttp().getRequest();

        let limit: number = defaults?.limit ?? MAX_PAGE_SIZE;
        let offset: number = defaults?.offset ?? 0;

        if(!isNull(request.query?.limit) && !isNaN(request.query?.limit)) {
            limit = Math.max(1, Math.min((defaults?.maxLimit ?? MAX_PAGE_SIZE), (parseInt(request.query?.limit) ?? defaults?.limit ?? MAX_PAGE_SIZE)));
        }
        if(!isNull(request.query?.offset) && !isNaN(request.query?.offset)) {
            offset = Math.max(0, (parseInt(request.query?.offset) ?? defaults?.offset ?? 0));
        }

        return new Pageable(offset, limit);
    }
);