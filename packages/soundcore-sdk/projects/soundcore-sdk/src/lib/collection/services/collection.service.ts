import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { Collection } from "../entities/collection.entity";

@Injectable()
export class SCDKCollectionService {

    constructor(
        private httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

    /**
     * Find information about the user's collection.
     * @returns Observable<Collection>
     */
    public findCollection(): Observable<Collection> {
        return this.httpClient.get<Collection>(`${this.options.api_base_uri}/v1/collections`)
    }

}