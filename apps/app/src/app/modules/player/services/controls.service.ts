import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { AppAudioService } from "./audio.service";

@Injectable({
    providedIn: "root"
})
export class AppControlsService {

    constructor(
        private readonly audio: AppAudioService,
    ) {}

    private readonly _shuffleSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private readonly _skipSubject: Subject<void> = new Subject();
    private readonly _prevSubject: Subject<void> = new Subject();

    public readonly $isShuffled: Observable<boolean> = this._shuffleSubject.asObservable();
    public readonly $isPaused: Observable<boolean> = this.audio.$isPaused;

    public readonly $onSkip: Observable<void> = this._skipSubject.asObservable();
    public readonly $onPrev: Observable<void> = this._prevSubject.asObservable();

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

    public play() {
        this.audio.play();
    }

    public pause() {
        this.audio.pause();
    }

    public skip() {
        this._skipSubject.next();
    }

    public prev() {
        this._prevSubject.next();
    }

    public stop() {
        this.audio.skipTime();
    }

    public seek(seconds: number) {
        this.audio.seek(seconds);
    }

}