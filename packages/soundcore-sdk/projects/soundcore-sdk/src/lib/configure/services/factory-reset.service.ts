import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SCSDK_OPTIONS } from "../../constants";
import { SCSDKOptions } from "../../scdk.module";
import { Future, toFuture } from "../../utils/future";

@Injectable()
export class SCSDKFactoryResetService {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) {}

    /**
     * Reset all parts of the application
     * @returns Future<boolean>
     */
    public resetAll(): Observable<Future<boolean>> {
        return this.httpClient.post<boolean>(`${this.options.api_base_uri}/v1/configure/reset`, null).pipe(toFuture());
    }

    /**
     * Reset the database
     * @returns Future<boolean>
     */
    public resetDatabase(): Observable<Future<boolean>> {
        return this.httpClient.post<boolean>(`${this.options.api_base_uri}/v1/configure/reset/database`, null).pipe(toFuture());
    }

    /**
     * Reset the search engine
     * @returns Future<boolean>
     */
    public resetSearchEngine(): Observable<Future<boolean>> {
        return this.httpClient.post<boolean>(`${this.options.api_base_uri}/v1/configure/reset/search-engine`, null).pipe(toFuture());
    }

}