import { Injectable } from "@angular/core";
import { Logger, SCSDKStreamService } from "@soundcore/sdk";
import { BehaviorSubject, from, map, Observable, of, Subject } from "rxjs";
import { PlayerItem } from "../entities/player-item.entity";

@Injectable({
    providedIn: "root"
})
export class AppAudioService {
    private readonly logger = new Logger("AudioService");
    private readonly _audioElement: HTMLAudioElement = new Audio();

    private readonly _onNextSubject: Subject<void> = new Subject();
    public readonly $onNext: Observable<void> = this._onNextSubject.asObservable();

    private readonly _isPausedSubject: BehaviorSubject<boolean> = new BehaviorSubject(this._audioElement.paused);
    public readonly $isPaused: Observable<boolean> = this._isPausedSubject.asObservable();

    private readonly _currenTimeSubject: BehaviorSubject<number> = new BehaviorSubject(0);
    public readonly $currentTime: Observable<number> = this._currenTimeSubject.asObservable();

    constructor(
        private readonly streamService: SCSDKStreamService
    ) {
        this._audioElement.onabort = (event) => this.handleOnAbort(event);
        this._audioElement.onerror = (event) => this.handleOnError(event);
        this._audioElement.onended = (event) => this.handleOnEnded(event);

        this._audioElement.onpause = () => this._isPausedSubject.next(true);
        this._audioElement.onplay = () => this._isPausedSubject.next(false);

        this._audioElement.ontimeupdate = () => this._currenTimeSubject.next(Math.ceil(this._audioElement.currentTime));
    }

    /**
     * Change audio player's src and play it.
     * This will request a stream token and automatically start streaming.
     */
    public forcePlay(item: PlayerItem): Observable<void> {
        this.resetTime();
        
        if(!item) {
            this._audioElement.src = ``;
        }

        return this.streamService.requestStreamUrl(item.song.id).pipe(map((url) => {
            const isTracklist = !!item.tracklist;
            this.logger.verbose(`Now playing "${item.song.name}" by "${item.song.primaryArtist?.name}"${(isTracklist ? ` on tracklist "${item.tracklist.context?.["name"]}"` : ``)}`);   

            this._audioElement.src = `${url}`;
            this._audioElement.play();
        }));
    }

    /**
     * reset current time to 0
     */
    public resetTime() {
        this._audioElement.currentTime = 0;
    }

    /**
     * Pause playback and reset current time to 0
     */
    public skipTime() {
        this.pause();
        this._audioElement.currentTime = 0;
    }

    public get currentTime(): number {
        return this._audioElement.currentTime;
    }

    /**
     * Pause player source.
     */
    public pause(): Observable<void> {
        this._audioElement.pause()
        return of(null);
    }

    /**
     * Resume player source.
     */
    public play(): Observable<void> {
        return from(this._audioElement.play());
    }

    public seek(seconds: number) {
        this._audioElement.currentTime = seconds;
    }

    public isPaused() {
        return this._audioElement.paused ?? true;
    }

    /**
     * Toggle playback of current source.
     */
    public toggle() {
        if(this._audioElement.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    private handleOnAbort(event: UIEvent) {
        console.log(event);
    }

    private handleOnLoaded(event: UIEvent) {

    }

    private handleOnError(event: string | Event) {
        this.logger.error(`Error occured in player: ${event.toString()}`, event);

        // TODO: Send message to user

        this._onNextSubject.next();
    }

    private handleOnEnded(event: Event) {
        this.logger.verbose(`Current audio ended.`);
        this._onNextSubject.next();
    }

}