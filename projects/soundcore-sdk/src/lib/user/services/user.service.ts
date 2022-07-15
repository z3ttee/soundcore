import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { ApiResponse } from "../../utils/responses/api-response";
import { apiResponse } from "../../utils/rxjs/operators/api-response";
import { User } from "../entities/user.entity";

@Injectable()
export class SCDKUserService {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

    /**
     * Make a request to the profiles endpoint
     * using the currently available access token.
     * This will fetch the user information for the currently
     * logged in user.
     * @returns {ApiResponse<User>} ApiResponse<User>
     */
    public findByCurrentUser(): Observable<ApiResponse<User>> {
        return this.httpClient.get<User>(`${this.options.api_base_uri}/v1/profiles/@me`).pipe(apiResponse());
    }

}