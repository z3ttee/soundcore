import { Settings } from "vscroll/dist/typings/interfaces";
import { Observable, of, switchMap } from "rxjs";
import { ApiResponse, apiResponse, Page, Pageable } from "@soundcore/sdk";
import { Pagination } from "../config/datasource-pagination";
import { HttpClient } from "@angular/common/http";
import { SCNGXBaseDatasource } from "./base-datasource.entity";

export class SCNGXDatasource<T = any> extends SCNGXBaseDatasource<T> {
    
    constructor(
        public readonly httpClient: HttpClient,
        public readonly pagination: Pagination,
        settings?: Settings<unknown>
    ) {
        super(pagination.pageSize, null, settings);
    }

    /**
     * Get the datasource items from the cache matching a pageIndex.
     * @param pageIndex Index of the requested page to lookup from cache
     * @returns DatasourceItem<T>[]
     */
    protected getPageData(pageable: Pageable): Observable<T[]> {
        // Make network call
        return this.httpClient.get<Page<T>>(`${this.pagination.url}${pageable.toQuery()}`).pipe(
            // Transform errors
            apiResponse(),
            // Intercept the response and switch to different observable type
            switchMap((response: ApiResponse<Page<T>>): Observable<T[]> => {
                const page = response?.payload;

                // If there were errors, set status to error.
                // Then it can be retried later.
                if(response.error) {
                    return of([]);
                }

                return of(page.elements);
            })
        );
    }
}