import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { isNull, Pageable } from "@repo/utilities";
import { Request } from "../api";

const MAX_PAGE_SIZE = 50;

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
  (defaults: { limit?: number; offset?: number; maxLimit?: number }, ctx: ExecutionContext): Pageable => {
    const request = ctx.switchToHttp().getRequest<Request>();

    let limit: number = defaults?.limit ?? MAX_PAGE_SIZE;
    let offset: number = defaults?.offset ?? 0;

    if (!isNull(request.query?.limit) && !isNaN(Number(request.query?.limit))) {
      limit = Math.max(
        1,
        Math.min(
          defaults?.maxLimit ?? MAX_PAGE_SIZE,
          parseInt(request.query?.limit) ?? defaults?.limit ?? MAX_PAGE_SIZE
        )
      );
    }
    if (!isNull(request.query?.offset) && !isNaN(Number(request.query?.offset))) {
      offset = Math.max(0, parseInt(request.query?.offset) ?? defaults?.offset ?? 0);
    }

    // Get list of keys that are available on the page filter object
    // const filterKeys: Array<keyof PageFilter> = Object.keys(new PageFilter()) as Array<keyof PageFilter>;
    // Init the map that holds key-value of the filter
    const filterMap = Object.create({});

    // Filter the query string and map
    // all key-values to the filter map
    for (const [key, val] of Object.entries(request.query)) {
      if (isNull(val) || typeof val !== "string") continue;

      try {
        filterMap[key] = JSON.parse(val);
      } catch (e) {
        filterMap[key] = val;
      }
    }

    return new Pageable(offset, limit, filterMap);
  }
);
