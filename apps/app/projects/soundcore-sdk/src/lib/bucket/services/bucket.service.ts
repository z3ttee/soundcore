import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { Page } from "../../utils/page/page";
import { Pageable } from "../../utils/page/pageable";
import { Bucket } from "../entities/bucket.entity";

@Injectable()
export class SCDKBucketService {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

    /**
     * Find a bucket by its id.
     * @param bucketId Bucket's id
     * @returns Bucket
     */
    public findById(bucketId: string): Observable<Bucket> {
        if(!bucketId) return of(null);
        return this.httpClient.get<Bucket>(`${this.options.api_base_uri}/v1/buckets/${bucketId}`);
    }

    /**
     * Find a page of buckets
     * @param pageable Page settings
     * @returns Page<Bucket>
     */
    public findPage(pageable: Pageable): Observable<Page<Bucket>> {
        return this.httpClient.get<Page<Bucket>>(`${this.options.api_base_uri}/v1/buckets${pageable.toQuery()}`);
    }

}