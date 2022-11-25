import { Settings } from "vscroll/dist/typings/interfaces";
import { Observable } from "rxjs";
import { Pageable } from "@soundcore/sdk";
import { DEFAULT_PAGE_SIZE, SCNGXBaseDatasource } from "./base-datasource.entity";
import { PageCacheItem } from "./page-cache.entity";

export class SCNGXOfflineDatasource<T extends PageCacheItem = any> extends SCNGXBaseDatasource<T> {
    
    constructor(
        items: T[],
        pageSize?: number,
        settings?: Settings<unknown>
    ) {
        super(pageSize ?? DEFAULT_PAGE_SIZE, items, settings);
    }

    /**
     * Get the datasource items from the cache matching a pageIndex.
     * @param pageIndex Index of the requested page to lookup from cache
     * @returns T[]
     */
    protected getPageData(pageable: Pageable): Observable<T[]> {
        return new Observable((subscriber) => {
            // this.getCachedPage(pageable.page).then((items) => {
            //     subscriber.next(items);
            // }).catch(() => {
            //     subscriber.next([]);
            // }).finally(() => {
            //     subscriber.complete();
            // })
        });
    }
}