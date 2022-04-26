import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { Observable, of } from "rxjs";
import { User } from "../../user/entities/user.entity";

@Injectable()
export class SCDKProfileService {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

    public findByCurrentUser(): Observable<User> {
        return this.httpClient.get<User>(`${this.options.api_base_uri}/v1/profiles/@me`);
    }

    public findByUserId(userId: string): Observable<User> {
        if(!userId) return of(null);
        return this.httpClient.get<User>(`${this.options.api_base_uri}/v1/profiles/${userId}`);
    }

}