import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, filter, Observable } from "rxjs";
import { SCDKOptions, SCDK_OPTIONS } from "./scdk.module";

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
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {
        const url = `${this.options.api_base_uri}/v1/`;
        this.httpClient.get<ApplicationInfo>(url).subscribe((info) => {
            this._appInfoSubject.next(info);
            console.log(`Successfully contacted backend application on '${url}'. Version: ${info.build.version}, Application mode: ${info.isDockerized ? 'Dockerized' : 'Standalone'}`);
        });
    }

}