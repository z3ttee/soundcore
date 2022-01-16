import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { Page, Pageable } from "src/app/pagination/pagination";
import { AuthenticationService } from "src/app/services/authentication.service";
import { environment } from "src/environments/environment";
import { StorageBucket } from "../model/storage-bucket.model";

@Injectable({
    providedIn: "root"
})
export class BucketService {

    constructor(private httpClient: HttpClient, private authService: AuthenticationService) {}

    public async findAllBuckets(pageable?: Pageable): Promise<Page<StorageBucket>> {
        return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/buckets${Pageable.toQuery(pageable)}`)) as Promise<Page<StorageBucket>>
    }

    public async findById(bucketId: string): Promise<StorageBucket> {
        return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/buckets/${bucketId}`)) as Promise<StorageBucket>
    }

}