import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { SCSDK_OPTIONS } from "../../constants";
import { SCSDKOptions } from "../../scdk.module";

@Injectable()
export class SCSDKCollectionService {

    constructor(
        private httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) {}

}