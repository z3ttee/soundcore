import { Injectable } from "@angular/core";

export const SETTINGS_AUDIO_FADE_KEY = "asc:settings::enableAudioFade"

@Injectable({
    providedIn: "root"
})
export class SettingsService {

    public isAudioFadeAllowed(): boolean {
        const value = localStorage.getItem(SETTINGS_AUDIO_FADE_KEY);
        if(value == null || typeof value == "undefined") return true; // Default value
        return value == "true"
    }

    public setAudioFadeAllowed(enableAudioFade: boolean): boolean {
        localStorage.setItem(SETTINGS_AUDIO_FADE_KEY, `${enableAudioFade}`);
        return enableAudioFade;
    }

}