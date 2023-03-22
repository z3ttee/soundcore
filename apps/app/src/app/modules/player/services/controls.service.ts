import { Injectable } from "@angular/core";
import { BehaviorSubject, fromEvent, map, mergeAll, Observable, Subject } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class AudioController {

    private readonly audioElement: HTMLAudioElement = new Audio();

    private readonly onEnded: Subject<void> = new Subject();
    public readonly $onEnded: Observable<void> = this.onEnded.asObservable();

    private readonly isPaused: BehaviorSubject<boolean> = new BehaviorSubject(this.audioElement.paused);
    public readonly $isPaused: Observable<boolean> = this.isPaused.asObservable();

    constructor() {
        this.audioElement.onended = () => this.onEnded.next();
        this.audioElement.onplaying = () => this.isPaused.next(false);
        this.audioElement.onpause = () => this.isPaused.next(true);
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

}