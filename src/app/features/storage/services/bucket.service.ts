import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { Page, Pageable } from "src/app/pagination/pagination";
import { environment } from "src/environments/environment";
import { Bucket } from "../entities/bucket.entity";

@Injectable()
export class BucketService {

    constructor(private httpClient: HttpClient) {}

    public async findBuckets(pageable: Pageable): Promise<Page<Bucket>> {
        return firstValueFrom(this.httpClient.get<Page<Bucket>>(`${environment.api_base_uri}/v1/buckets${Pageable.toQuery(pageable)}`))
    }

    public async findById(bucketId: string): Promise<Bucket> {
        return firstValueFrom(this.httpClient.get<Bucket>(`${environment.api_base_uri}/v1/buckets/${bucketId}`))
    }

}