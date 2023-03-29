import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { SCSDKOptions } from "../../scdk.module";
import { Observable, of } from "rxjs";
import { User } from "../../user/entities/user.entity";
import { ApiResponse } from "../../utils/responses/api-response";
import { apiResponse } from "../../utils/rxjs/operators/api-response";
import { Artist } from "../../artist/entities/artist.entity";
import { SCSDK_OPTIONS } from "../../constants";
import { Page } from "@soundcore/common";

@Injectable()
export class SCSDKProfileService {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) {}

    public findByUserId(userId: string): Observable<ApiResponse<User>> {
        if(!userId) return of(ApiResponse.withPayload(null));
        return this.httpClient.get<User>(`${this.options.api_base_uri}/v1/profiles/${userId}`).pipe(apiResponse());
    }

    public findTopArtistsByUser(userId: string): Observable<ApiResponse<Page<Artist>>> {
        if(!userId) return of(ApiResponse.withPayload(null));
        return this.httpClient.get<Page<Artist>>(`${this.options.api_base_uri}/v1/profiles/${userId}/topArtists`).pipe(apiResponse());
    }

}