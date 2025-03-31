import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Future, toFuture } from "@repo/utilities";
import { Observable } from "rxjs";
import { SCSDK_OPTIONS } from "../../constants";
import type { SCSDKOptions } from "../../scdk.module";
import { DeviceInfo } from "../entities/device-info.entity";

@Injectable()
export class SCSDKMetricsService {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) { }

    public findDeviceInfo(): Observable<Future<DeviceInfo>> {
        return this.httpClient.get<DeviceInfo>(`${this.options.api_base_uri}/v1/metrics/device`).pipe(toFuture());
    }

}