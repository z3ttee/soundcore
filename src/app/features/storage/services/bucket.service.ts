import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { Page, Pageable } from "src/app/pagination/pagination";
import { environment } from "src/environments/environment";
import { StorageBucket } from "../model/storage-bucket.model";

@Injectable()
export class BucketService {

    constructor(private httpClient: HttpClient) {}

    public async findAllBuckets(pageable?: Pageable): Promise<Page<StorageBucket>> {
        return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/buckets${Pageable.toQuery(pageable)}`)) as Promise<Page<StorageBucket>>
    }

    public async findById(bucketId: string): Promise<StorageBucket> {
        return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/buckets/${bucketId}`)) as Promise<StorageBucket>
    }

}