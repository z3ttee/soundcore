import { HttpClient } from "@angular/common/http";
import { Page, Pageable } from "@soundcore/common";
import { SCSDKBaseDatasource, toFuture } from "@soundcore/sdk";
import { filter, map, Observable, of } from "rxjs";

export type SCNGXDatasourceFreeHandler = () => boolean;

/**
 * @deprecated
 */
export class SCNGXDatasource<T = any> extends SCSDKBaseDatasource<T> {

    constructor(
        private readonly httpClient: HttpClient,
        private readonly pageableUrl: string,
        initialSize?: number,
        pageSize?: number,
        primaryKey?: keyof T,
    ) {
        super(pageSize ?? 30, initialSize, primaryKey);
    }

    protected fetchPage(pageIndex: number): Observable<T[]> {
        const pageable = new Pageable(pageIndex, this.pageSize);

        if(typeof this.pageableUrl === "undefined" || this.pageableUrl == null) return of([]);
        return this.httpClient.get<Page<T>>(`${this.pageableUrl}${pageable.toQuery()}`).pipe(
            toFuture(),
            filter((request) => !request.loading),
            map((request) => {
                if(request.error) {
                    throw request.error;
                }

                // Get page data and return it
                const page = request.data ?? Page.empty(pageable);

                this.setTotalSize(page.totalSize);
                return page.items;
            })
        );
    }
}