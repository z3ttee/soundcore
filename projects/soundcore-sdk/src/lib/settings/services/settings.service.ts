import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Settings } from "../entities/settings.entity";
import { SETTINGS_STORE_KEY } from "../settings.module";

@Injectable()
export class SCSDKSettingsService {

    constructor(
        private readonly httpClient: HttpClient
    ) {}

    public findSettings(): Observable<Settings> {
        const stored = localStorage?.getItem(SETTINGS_STORE_KEY);
        if(!stored) {
            localStorage?.setItem(SETTINGS_STORE_KEY, JSON.stringify(new Settings()));
        }

        const settings = JSON.parse(localStorage?.getItem(SETTINGS_STORE_KEY));
        return Object.assign(new Settings(), settings);
    }

}