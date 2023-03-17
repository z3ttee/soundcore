import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { SCSDK_OPTIONS } from "./constants";
import { SCSDKOptions } from "./scdk.module";

export class ApplicationBuildInfo {
    public version: string;
    public builtAt: number;
    public buildId: string;
}

export class ApplicationInfo {
    public build: ApplicationBuildInfo;
    public isDockerized: boolean;
}

@Injectable({
    providedIn: "root"
})
export class SCSDKAppService {

    private readonly _appInfoSubject: BehaviorSubject<ApplicationInfo> = new BehaviorSubject(null);
    public readonly $appInfo: Observable<ApplicationInfo> = this._appInfoSubject.asObservable();

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) {
        const url = `${this.options.api_base_uri}/v1/`;
        this.httpClient.get<ApplicationInfo>(url).subscribe((info) => {
            this._appInfoSubject.next(info);
            console.log(`Successfully contacted backend application on '${url}'. Version: ${info.build.version}, Application mode: ${info.isDockerized ? 'Dockerized' : 'Standalone'}`);
        });
    }

}