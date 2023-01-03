import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";

@Injectable()
export class SCSDKCollectionService {

    constructor(
        private httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

}