import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { SCSDKOptions } from "../../scdk.module";
import { Zone } from "../entities/zone.entity";
import { Page, Pageable } from "@soundcore/common";
import { SCSDK_OPTIONS } from "../../constants";

@Injectable()
export class SCSDKZoneService {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) {}

    /**
     * Find a zone by its id.
     * @param zoneId Zone's id
     * @returns Zone
     */
    public findById(zoneId: string): Observable<Zone> {
        if(!zoneId) return of(null);
        return this.httpClient.get<Zone>(`${this.options.api_base_uri}/v1/zones/${zoneId}`);
    }

    /**
     * Find a page of buckets
     * @param pageable Page settings
     * @returns Page<Zone>
     */
    public findPage(pageable: Pageable): Observable<Page<Zone>> {
        return this.httpClient.get<Page<Zone>>(`${this.options.api_base_uri}/v1/zones${pageable.toQuery()}`);
    }

}