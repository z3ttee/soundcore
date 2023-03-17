import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
<<<<<<< HEAD
import { SCSDKOptions, SCSDK_OPTIONS } from "../../scdk.module";
=======
import { SCSDK_OPTIONS } from "../../constants";
import { SCSDKOptions } from "../../scdk.module";
>>>>>>> main

@Injectable()
export class SCSDKCollectionService {

    constructor(
        private httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) {}

}