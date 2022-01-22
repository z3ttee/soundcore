import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { AuthenticationService } from "src/app/sso/authentication.service";
import { environment } from "src/environments/environment";
import { Song } from "../../song/entities/song.entity";
import { StreamQueueService } from "./queue.service";
import { StreamService } from "./stream.service";

/*export class AudioInfo {
    public volume: number = 0;
    public currentTime: number = 0;
    public paused: boolean = false;
    public loading: boolean = false;
}*/

@Injectable({
    providedIn: "root"
})
export class AudioService {

    private audio = new Audio();

    private _currentSongSubject: BehaviorSubject<Song> = new BehaviorSubject(null);
    private _pausedSubject: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);
    private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);
    private _currentTimeSubject: BehaviorSubject<number> = new BehaviorSubject(0);

    public $currentSong: Observable<Song> = this._currentSongSubject.asObservable();
    public $paused: Observable<boolean> = this._pausedSubject.asObservable();
    public $loading: Observable<boolean> = this._loadingSubject.asObservable();
    public $currentTime: Observable<number> = this._currentTimeSubject.asObservable();

    constructor(
        private streamService: StreamService,
        private queueService: StreamQueueService
    ) {

        this.audio.autoplay = true;
        this.audio.src = "";

        this.audio.onplay = () => this.onPlayerResumed();
        this.audio.onpause = () => this.onPlayerPaused();

    }

    /**
     * Continue playing a song or provide a song object
     * to force play a new song.
     */
    public async play(song?: Song) {
        if(song) {
            this.audio.src = await this.streamService.getStreamURL(song);
        }

        this._pausedSubject.next(false);
        this.audio.play();
    }

    /**
     * Enqueue new song to be played next.
     * @param song Song
     */
    public async enqueueSong(song: Song) {
        this.queueService.enqueue(song);
    }

    /**
     * Pause the playing audio
     */
    public pause() {

        
        this.audio.pause();
    }

    /**
     * Reset audio player.
     */
    public reset() {

    }

    public setCurrentTime() {
        // TODO
    }

    public setVolume() {
        // TODO:
    }











    private onPlayerPaused() {
        this._pausedSubject.next(true);
    }
    private onPlayerResumed() {
        this._pausedSubject.next(false);
    }
    private onTimeUpdated() {
        this._currentTimeSubject.next(this.audio.currentTime);
    }

    /*private _songSubject: BehaviorSubject<Song> = new BehaviorSubject(null)
    private _infoSubject: BehaviorSubject<AudioInfo> = new BehaviorSubject(new AudioInfo())


    private readonly audio = new Audio();
    
    public $song: Observable<Song> = this._songSubject.asObservable()
    public $info: Observable<AudioInfo> = this._infoSubject.asObservable()


    constructor(
        private queueService: StreamQueueService,
        private authService: AuthenticationService
    ){

        this.audio.onloadstart = () => this.onLoad();
        this.audio.onloadeddata = () => this.onLoaded();
        this.audio.onerror = (error) => this.onError(error);
        this.audio.onended = () => this.onEnded();
        this.audio.ontimeupdate = () => this.onTimeUpdated();

        this.audio.autoplay = true;
        this.audio.volume = 0.5;

    }

    public async getStreamURL(song: Song) {
        if(!song) return "";
        return `${environment.api_base_uri}/v1/streams/songs/${song.id}?accessToken=${this.authService.getAccessToken()}`;
    }

    public async forcePlay(song: Song) {
        const url = await this.getStreamURL(song);

        const info = this._infoSubject.getValue();
        info.currentTime = 0;
        info.volume = this.audio.volume;
        info.paused = this.audio.paused;
        this._infoSubject.next(info)

        this.audio.currentTime = 0;
        this.audio.src = url;
        this._songSubject.next(song);
    }

    public async play(song: Song) {
        this.queueService.enqueue(song);

        if(!this._songSubject.getValue()) {
            // Currently no song playing, meaning we can start this one
            this.forcePlay(song);
        }
    }

    public setVolume(volume: number) {
        this.audio.volume = volume;

        const info = this._infoSubject.getValue();
        info.volume = this.audio.volume;
        this._infoSubject.next(info)
    }

    public setPaused(paused: boolean) {
        if(paused) this.audio.pause();
        else this.audio.play();

        const info = this._infoSubject.getValue();
        info.paused = this.audio.paused;
        this._infoSubject.next(info)
    }
    





    private onEnded() {
        const nextSong = this.queueService.dequeue();
        if(!nextSong) {
            console.log("[AUDIO] Queue is empty.");
            return;
        }

        this.play(nextSong);
    }

    private onError(error) {
        console.error(error)
    }

    private onLoad() {
        const info = this._infoSubject.getValue();
        info.loading = true;
        this._infoSubject.next(info)
    }

    private onLoaded() {
        const info = this._infoSubject.getValue();
        info.loading = false;
        this._infoSubject.next(info)
    }

    private onTimeUpdated() {
        const info = this._infoSubject.getValue();
        info.currentTime = this.audio.currentTime;
        this._infoSubject.next(info)
    }*/


}