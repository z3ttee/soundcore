import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom, Observable } from "rxjs";
import { Page } from "src/app/pagination/pagination";
import { AuthenticationService } from "src/app/services/authentication.service";
import { environment } from "src/environments/environment";
import { StorageBucket } from "../model/storage-bucket.model";

@Injectable({
    providedIn: "root"
})
export class BucketService {

    constructor(private httpClient: HttpClient, private authService: AuthenticationService) {}

    public async findAvailableBuckets(): Promise<Page<StorageBucket>> {
        return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/storage-buckets`, { headers: { "Authorization": `Bearer ${this.authService.getAccessToken()}`}})) as Promise<Page<StorageBucket>>
    }

}