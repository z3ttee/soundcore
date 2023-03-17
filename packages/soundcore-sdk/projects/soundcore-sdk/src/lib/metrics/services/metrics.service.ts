import { DeviceInfo } from "../entities/device-info.entity";
import { Inject, Injectable } from "@angular/core";
import { SCSDKOptions, SCSDK_OPTIONS } from "../../scdk.module";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Future, toFuture } from "../../utils/future";

@Injectable()
export class SCSDKMetricsService {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) {}

    public findDeviceInfo(): Observable<Future<DeviceInfo>> {
        return this.httpClient.get<DeviceInfo>(`${this.options.api_base_uri}/v1/metrics/device`).pipe(toFuture());
    }

}