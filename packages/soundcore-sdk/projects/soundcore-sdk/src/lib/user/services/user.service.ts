import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { MeiliUser } from "../../meilisearch/entities/meili-user.entity";
import { ApiSearchResponse } from "../../meilisearch/entities/search-response.entity";
<<<<<<< HEAD
import { SCSDKOptions, SCSDK_OPTIONS } from "../../scdk.module";
=======
import { SCSDKOptions } from "../../scdk.module";
>>>>>>> main
import { ApiResponse } from "../../utils/responses/api-response";
import { apiResponse } from "../../utils/rxjs/operators/api-response";
import { User } from "../entities/user.entity";
import { Pageable } from "../../pagination";
import { SCSDK_OPTIONS } from "../../constants";

@Injectable()
export class SCDKUserService {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
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

    /**
     * Search users by a given query.
     * @param {string} query Search query
     * @param {Pageable} pageable Page settings
     * @returns {ApiResponse<ApiSearchResponse<MeiliUser>>} ApiResponse<ApiSearchResponse<MeiliUser>>
     */
    public searchUser(query: string, pageable: Pageable): Observable<ApiResponse<ApiSearchResponse<MeiliUser>>> {
        return this.httpClient.get<ApiSearchResponse<MeiliUser>>(`${this.options.api_base_uri}/v1/search/users/?q=${query}&${pageable.toParams()}`).pipe(apiResponse());
    }

}