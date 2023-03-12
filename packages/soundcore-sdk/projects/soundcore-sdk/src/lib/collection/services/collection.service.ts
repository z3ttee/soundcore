import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { SCDK_OPTIONS } from "../../constants";
import { SCDKOptions } from "../../scdk.module";

@Injectable()
export class SCSDKCollectionService {

    constructor(
        private httpClient: HttpClient,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

}