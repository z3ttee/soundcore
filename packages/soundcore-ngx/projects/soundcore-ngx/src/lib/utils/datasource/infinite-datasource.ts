import { HttpClient } from "@angular/common/http";
import { BaseDatasource, DatasourceOptions } from "./datasource";

/**
 * Datasource class to handle
 * infinite scroll fetching more
 * easily
 */
 export class SCNGXInfiniteDataSource<T> extends BaseDatasource<T> {

    constructor(
        httpClient: HttpClient,
        options: DatasourceOptions
    ) {
        super(httpClient, options);
    }

}