import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { VolumeManager } from "../managers/volume-manager";
import { ShuffleManager } from "../managers/shuffle-manager";

@Injectable({
    providedIn: "platform"
})
export class AudioController {

    private readonly audioElement: HTMLAudioElement = new Audio();
    private readonly volumeManager = new VolumeManager(this.audioElement);
    private readonly shuffleManager = new ShuffleManager();

    private readonly onEnded: Subject<void> = new Subject();
    public readonly $onEnded = this.onEnded.asObservable();

    private readonly isPaused: BehaviorSubject<boolean> = new BehaviorSubject(this.audioElement.paused);
    public readonly $isPaused = this.isPaused.asObservable();

    private readonly currenTime: BehaviorSubject<number> = new BehaviorSubject(this.audioElement.currentTime);
    public readonly $currenTime = this.currenTime.asObservable();

    public readonly $volume = this.volumeManager.$volume;
    public readonly $muted = this.volumeManager.$muted;
    public readonly $shuffled = this.shuffleManager.$shuffled;

    constructor() {
        this.audioElement.onended = () => this.onEnded.next();
        this.audioElement.onplaying = () => this.isPaused.next(false);
        this.audioElement.onpause = () => this.isPaused.next(true);
        this.audioElement.ontimeupdate = () => this.currenTime.next(this.audioElement.currentTime)
    }

    public get shuffled() {
        return this.shuffleManager.isShuffled;
    }

    public play(url: string): Observable<string> {
        return new Observable((subscriber) => {
            this.audioElement.src = url;
            this.audioElement.play().finally(() => {
                // Complete observable after starting to play
                subscriber.next(url);
                subscriber.complete();
            });
        });
    }

    /**
     * Toggle playing or paused state
     * @returns True, if the player is now playing. Otherwise false
     */
    public togglePlaying(): boolean {
        if(!this.audioElement.paused) {
            this.audioElement.pause();
            return false;
        } else {
            this.audioElement.play();
            return true;
        }
    }

    public resetCurrentlyPlaying(pause: boolean = false) {
        this.audioElement.currentTime = 0;
        if(pause) {
            this.audioElement.pause();
        }
    }

    public toggleMute() {
        this.volumeManager.toggleMute();
    }

    public setVolume(volume: number): void {
        this.volumeManager.setVolume(volume);
    }

    public toggleShuffle() {
        this.shuffleManager.toggleShuffled();
    }

}