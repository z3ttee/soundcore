import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { Observable, of } from "rxjs";
import { User } from "../../user/entities/user.entity";
import { ApiResponse } from "../../utils/responses/api-response";
import { apiResponse } from "../../utils/rxjs/operators/api-response";

@Injectable()
export class SCDKProfileService {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

    public findByUserId(userId: string): Observable<ApiResponse<User>> {
        if(!userId) return of(ApiResponse.withPayload(null));
        return this.httpClient.get<User>(`${this.options.api_base_uri}/v1/profiles/${userId}`).pipe(apiResponse());
    }

}