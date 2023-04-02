import { HttpClient } from "@angular/common/http";
import { Page, Pageable } from "@soundcore/common";
import { filter, map, Observable, of } from "rxjs";
import { toFuture } from "../future/future-operator";
import { SCSDKBaseDatasource } from "./base-datasource";

/**
 * Datasource to handle automatic pagination in lists.
 * @template {T} Type of items in the datasource
 */
export class SCSDKDatasource<T = any> extends SCSDKBaseDatasource<T> {

    constructor(
        private readonly httpClient: HttpClient,
        private readonly pageableUrl: string,
        initialSize?: number,
        pageSize?: number,
        primaryKey?: keyof T,
    ) {
        super(pageSize ?? 30, initialSize, primaryKey);
    }

    protected fetchPage(offset: number): Observable<T[]> {
        const pageable = new Pageable(offset, this.pageSize);

        if(typeof this.pageableUrl === "undefined" || this.pageableUrl == null) return of([]);
        return this.httpClient.get<Page<T>>(`${this.pageableUrl}${pageable.toQuery()}`).pipe(
            toFuture(),
            filter((request) => !request.loading),
            map((request) => {
                if(request.error) {
                    throw request.error;
                }

                // Get page data and return it
                const page = request.data ?? Page.of([], 0, pageable);

                this.setTotalSize(page.totalSize);
                return page.items;
            })
        );
    }
}