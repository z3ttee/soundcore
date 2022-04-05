import { HttpClient } from "@angular/common/http"
import { Inject, Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { Page } from "../../pagination/page"
import { Pageable } from "../../pagination/pageable"
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module"
import { Bucket } from "../entities/bucket.entity"

@Injectable({
    providedIn: "root"
})
export class SCDKBucketService {

    constructor(
        private httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

    /**
     * Find bucket by its id
     * @param bucketId Bucket's id
     * @returns Observable<Bucket>
     */
    public findById(bucketId: string): Observable<Bucket> {
        return this.httpClient.get<Bucket>(`${this.options.api_base_uri}/v1/buckets/${bucketId}`)
    }

    /**
     * Find a page of buckets.
     * @param pageable Page settings.
     * @returns Observable<Page<Bucket>>
     */
    public find(pageable: Pageable): Observable<Page<Bucket>> {
        return this.httpClient.get<Page<Bucket>>(`${this.options.api_base_uri}/v1/buckets${Pageable.toQuery(pageable)}`)
    }

}