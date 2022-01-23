import { Injectable } from "@angular/core";
import { BehaviorSubject, filter, Observable } from "rxjs";
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
    private _volumeSubject: BehaviorSubject<number> = new BehaviorSubject(0.3);
    private _doneSubject: BehaviorSubject<boolean> = new BehaviorSubject(true as boolean);
    private _loopSubject: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);
    private _shuffleSubject: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);

    public $currentSong: Observable<Song> = this._currentSongSubject.asObservable();
    public $paused: Observable<boolean> = this._pausedSubject.asObservable();
    public $loading: Observable<boolean> = this._loadingSubject.asObservable();
    public $currentTime: Observable<number> = this._currentTimeSubject.asObservable();
    public $volume: Observable<number> = this._volumeSubject.asObservable();
    public $done: Observable<boolean> = this._doneSubject.asObservable();
    public $loop: Observable<boolean> = this._loopSubject.asObservable();
    public $shuffle: Observable<boolean> = this._shuffleSubject.asObservable();

    public $queueSize: Observable<number>;

    constructor(
        private streamService: StreamService,
        private queueService: StreamQueueService
    ) {
        this.$queueSize = this.queueService.$size;
        this.reset();
        
        this.audio.onplay = () => this.onPlayerResumed();
        this.audio.onpause = () => this.onPlayerPaused();
        this.audio.ontimeupdate = () => this.onTimeUpdated();
        this.audio.onload = () => this.onLoadStart();
        this.audio.onwaiting = () => this.onLoadStart();
        this.audio.oncanplay = () => this.onLoadEnd();
        this.audio.onloadeddata = () => this.onLoadEnd();
        this.audio.onvolumechange = () => this.onVolumeChanged();
        this.audio.onended = () => this.onEnded();

        this.$paused.pipe(filter((paused) => !paused)).subscribe(() => {
            this.setSession(this._currentSongSubject.getValue());
        })
    }

    /**
     * Continue playing a song or provide a song object
     * to force play a new song.
     */
    public async play(song?: Song) {
        if(song) {
            this.audio.src = await this.streamService.getStreamURL(song);
            this._currentSongSubject.next(song);
        }
        
        this.audio.play();
    }


    /**
     * Play next song in queue.
     * @returns 
     */
    public async next() {
        const nextSong = this._shuffleSubject.getValue() ? this.queueService.random() : this.queueService.dequeue();
        if(!nextSong) {
            this._doneSubject.next(true);
            console.warn("[AUDIO] Can't start next song: Queue is empty.")
            return;
        }

        this._doneSubject.next(false);
        this.play(nextSong);
    }

    /**
     * Toggle pause.
     */
    public async togglePause() {
        const isPaused = this._pausedSubject.getValue();
        if(isPaused) this.play();
        else this.pause();
    }

    public async toogleLoop() {
        if(this.audio.loop) {
            this.audio.loop = false
        } else {
            this.audio.loop = true
        }

        this._loopSubject.next(this.audio.loop)
    }

    public async toggleShuffle() {
        const shuffled = this._shuffleSubject.getValue();
        this._shuffleSubject.next(!shuffled);
    }

    /**
     * Enqueue new song to be played next.
     * @param song Song
     */
    public async enqueueSong(song: Song) {
        const done = this._doneSubject.getValue();
        console.log(done)
        this.queueService.enqueue(song);

        if(done) {
            this.next();
        }
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
        this.audio.autoplay = true;
        this.audio.src = "";
        this.audio.volume = 0.3;
    }

    public setCurrentTime(currentTime: number) {
        this.audio.currentTime = currentTime;
    }

    public setVolume(volume: number) {
        this.audio.volume = volume;
    }




    private async setSession(song: Song) {
        if(!song) return;

        if(!navigator.mediaSession) {
            console.warn("[AUDIO] Browser does not support MediaSession API. This prevents the application from providing the OS information about the current song metadata.")
            return;
        }

        console.log("[AUDIO] Updating mediaSession.")

        // TODO: Add handlers to catch next and prev etc.

        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            album: song.albums ? song.albums[0]?.title : undefined,
            artist: song.artists.map((a) => a.name).join(", "),
            artwork: [
                { src: song.artwork ? `${environment.api_base_uri}/v1/artworks/${song.artwork.id}` : "/assets/img/missing_cover.png" }
            ]
        })
    }


    private onLoadStart() {
        this._loadingSubject.next(true)
    }
    private onLoadEnd() {
        this._loadingSubject.next(false)
    }
    private onPlayerPaused() {
        this._doneSubject.next(false);
        this._pausedSubject.next(true);
    }
    private onPlayerResumed() {
        this._doneSubject.next(false);
        this._pausedSubject.next(false);
    }
    private onTimeUpdated() {
        this._currentTimeSubject.next(this.audio.currentTime);
    }
    private onVolumeChanged() {
        this._volumeSubject.next(this.audio.volume)
    }
    private onEnded() {
        this.next();
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