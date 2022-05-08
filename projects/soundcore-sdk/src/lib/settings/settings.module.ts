import { NgModule } from "@angular/core";
import { SCSDKSettingsService } from "./services/settings.service";

export const SETTINGS_STORE_KEY = "soundcore::settings";

@NgModule({
    providers: [
        SCSDKSettingsService
    ]
})
export class SCSDKSettingsModule {}