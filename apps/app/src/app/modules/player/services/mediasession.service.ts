import { Injectable } from "@angular/core";
import { Logger } from "@soundcore/sdk";
import { PlayerItem } from "../entities/player-item.entity";
import { AppControlsService } from "./controls.service";

@Injectable({
    providedIn: "root"
})
export class AppMediasessionService {
    private readonly logger = new Logger("MediaSession");
    private readonly session: MediaSession;

    constructor(
        private readonly controls: AppControlsService
    ) {
        if(!this.supportsMediaSessionApi()) {
            this.logger.warn(`The browser does not support mediaSession API. This can cause bad user experience as OS-specific player controls may not work with the internal player.`);
            return;
        }

        this.session = navigator.mediaSession;
        this.bindControls();
    }

    public setSession(item: PlayerItem) {
        // Reset metadata if item is null
        if(typeof item === "undefined" || item == null) {
            console.log("Mediasession has been reset.");
            this.session.metadata = null;
            return;
        }

        console.log("Setting media session using: ", item?.song);

        // Update metadata
        this.session.metadata = new MediaMetadata({
            title: item.song?.name,
            artist: item.song?.primaryArtist?.name,
            album: item.song?.album?.name,
            artwork: []
        });   
    }

    private supportsMediaSessionApi(): boolean {
        const mediaSession: MediaSession = navigator.mediaSession;
        return typeof mediaSession !== "undefined" && mediaSession != null;
    }

    private bindControls() {
        this.session.setActionHandler("play", () => {
            this.controls.play();
            this.logger.debug(`Received action handler: play()`);
        });
        this.session.setActionHandler("pause", () => {
            this.controls.pause();
            this.logger.debug(`Received action handler: pause()`);
        });
        this.session.setActionHandler("nexttrack", () => {
            this.controls.skip();
            this.logger.debug(`Received action handler: nexttrack()`);
        });
        this.session.setActionHandler("previoustrack", () => {
            this.controls.prev();
            this.logger.debug(`Received action handler: previoustrack()`);
        });
        this.session.setActionHandler("stop", () => {
            this.controls.stop();
            this.logger.debug(`Received action handler: stop()`);
        });
    }

}