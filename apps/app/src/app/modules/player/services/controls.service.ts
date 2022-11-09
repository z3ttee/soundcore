import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { AppAudioService } from "./audio.service";

@Injectable({
    providedIn: "root"
})
export class AppControlsService {

    constructor(
        private readonly audio: AppAudioService
    ) {}

    private readonly _shuffleSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public readonly $isShuffled: Observable<boolean> = this._shuffleSubject.asObservable();

    public readonly $isPaused: Observable<boolean> = this.audio.$isPaused;

    /**
     * Check if the player is currently shuffled.
     * @returns True or False
     */
    public isShuffled(): boolean {
        return this._shuffleSubject.getValue();
    }

    /**
     * Toggle playback of current source.
     */
    public toggle() {
        this.audio.toggle();
    }

}