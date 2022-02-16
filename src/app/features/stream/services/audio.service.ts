import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BehaviorSubject, filter, interval, Observable, skip, takeUntil, timer } from "rxjs";
import { PlayableList } from "src/app/entities/playable-list.entity";
import { environment } from "src/environments/environment";
import { Song } from "../../song/entities/song.entity";
import { StreamQueueService } from "./queue.service";
import { StreamService } from "./stream.service";

export const PLAYER_VOLUME_KEY = "asc::player_volume"

const FADE_AUDIO_CROSS_MS = 8000;
const FADE_AUDIO_TOGGLE_MS = 1000;

@Injectable({
    providedIn: "root"
})
export class AudioService {

    private audio = new Audio();

    private _currentSongSubject: BehaviorSubject<Song> = new BehaviorSubject(null);
    private _pausedSubject: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);
    private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);
    private _currentTimeSubject: BehaviorSubject<number> = new BehaviorSubject(0);
    private _volumeSubject: BehaviorSubject<number> = new BehaviorSubject(this.getRestoredVolume());
    private _doneSubject: BehaviorSubject<boolean> = new BehaviorSubject(true as boolean);
    private _loopSubject: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);
    private _shuffleSubject: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);
    private _errorSubject: BehaviorSubject<string> = new BehaviorSubject(null);

    public $currentSong: Observable<Song> = this._currentSongSubject.asObservable();
    public $paused: Observable<boolean> = this._pausedSubject.asObservable();
    public $loading: Observable<boolean> = this._loadingSubject.asObservable();
    public $currentTime: Observable<number> = this._currentTimeSubject.asObservable();
    public $volume: Observable<number> = this._volumeSubject.asObservable();
    public $done: Observable<boolean> = this._doneSubject.asObservable();
    public $loop: Observable<boolean> = this._loopSubject.asObservable();
    public $shuffle: Observable<boolean> = this._shuffleSubject.asObservable();
    public $error: Observable<string> = this._errorSubject.asObservable();
    public $queueSize: Observable<number>;

    public get paused(): boolean {
        return this._pausedSubject.getValue();
    }

    public get currentSong(): Song {
        return this._currentSongSubject.getValue();
    }

    constructor(
        private streamService: StreamService,
        private queueService: StreamQueueService,
        private _snackBar: MatSnackBar
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
        this.audio.onerror = (event: Event) => this.onError(event);

        this.$paused.pipe(filter((paused) => !paused)).subscribe(() => {
            this.setSession(this._currentSongSubject.getValue());
        })
    }

    /**
     * Continue playing a song or provide a song object
     * to force play a new song.
     */
    public async play(song?: Song, fadeIn: boolean = false) {
        if(song) {
            this.audio.src = await this.streamService.getStreamURL(song);
            this._currentSongSubject.next(song);
        }
        
        if(!fadeIn) this.audio.volume = this._volumeSubject.getValue();
        this.audio.play().then(() => {
            if(fadeIn) this.fadeInAudio(FADE_AUDIO_TOGGLE_MS);
        }).catch(() => {
            this.showError("Das Lied kann nicht abgespielt werden.")
        });
    }

    public async fadeInAudio(fadeDuration: number) {
        return new Promise<void>((resolve) => {
            const dstVolume = this._volumeSubject.getValue();
            const delay = fadeDuration / 100;
            const volumeInc = (dstVolume / fadeDuration) * delay;

            this.audio.volume = 0;
            const subscription = interval(delay).pipe(takeUntil(this.$paused.pipe(filter((paused) => paused))), takeUntil(this.$volume.pipe(skip(1)))).subscribe(() => {

                if(this.audio.volume + volumeInc > 1 || this.audio.volume >= dstVolume) {
                    this.audio.volume = this.audio.volume > 1 ? 1 : dstVolume;
                    resolve();
                    subscription.unsubscribe();
                    return;
                }

                this.audio.volume += volumeInc;
            })
        })
        
    }

    public async fadeOutAudio(fadeDuration: number) {
        this._pausedSubject.next(true);
        return new Promise<void>((resolve) => {
            const srcVolume = this.audio.volume;
            const delay = fadeDuration / 100;
            const volumeInc = (srcVolume / fadeDuration) * delay;

            const subscription = interval(delay).pipe(takeUntil(this.$paused.pipe(filter((paused) => !paused))), takeUntil(this.$volume.pipe(skip(1)))).subscribe(() => {               
                if(this.audio.volume - volumeInc <= 0) {
                    this.audio.volume = 0;
                    resolve();
                    subscription.unsubscribe();
                    return;
                }

                this.audio.volume -= volumeInc;
            })
        })
    }

    /**
     * Force play of the selected list.
     */
    public async playList(playableList: PlayableList<any>) {
        this.enqueueList(playableList)
    }


    /**
     * Play next song in queue.
     */
    public async next() {
        const nextSong = this._shuffleSubject.getValue() ? await this.queueService.random() : await this.queueService.dequeue();
        if(!nextSong) {
            this._doneSubject.next(true);
            console.warn("[AUDIO] Can't start next song: Queue is empty.")
            return;
        }

        this._doneSubject.next(false);
        this.play(nextSong);
    }

    public async prev() {

    }

    /**
     * Toggle pause.
     */
    public async togglePause() {
        const isPaused = this._pausedSubject.getValue();
        if(isPaused) this.play(null, true);
        else this.pause(true);
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
        this.queueService.enqueueSong(song);

        if(done) {
            this.next();
        }
    }

    public async enqueueList(list: PlayableList<any>) {
        const done = this._doneSubject.getValue();
        console.log(done)
        this.queueService.enqueueList(list);

        if(done) {
            this.next();
        }
    }

    /**
     * Pause the playing audio
     */
    public pause(fadeOut: boolean = true) {
        if(!fadeOut) {
            this.audio.pause();
            return;
        }

        this.fadeOutAudio(FADE_AUDIO_TOGGLE_MS).then(() => this.audio.pause());
    }

    /**
     * Reset audio player.
     */
    public reset() {
        this.audio.autoplay = true;
        this.audio.volume = this.getRestoredVolume();
        this.audio.removeAttribute("src")
        this.pause(false)
    }

    public setCurrentTime(currentTime: number) {
        this.audio.currentTime = currentTime;
    }

    public setVolume(volume: number) {
        this.audio.volume = volume;
        this._volumeSubject.next(this.audio.volume);
        localStorage?.setItem(PLAYER_VOLUME_KEY, `${this.audio.volume}`)
    }

    public getRestoredVolume(): number {
        return parseFloat(localStorage?.getItem(PLAYER_VOLUME_KEY)) || 1;
    }

    private async setSession(song: Song) {
        if(!song) return;

        if(!navigator.mediaSession) {
            console.warn("[AUDIO] Browser does not support MediaSession API. This prevents the application from providing the OS information about the current song metadata.")
            return;
        }

        console.log("[AUDIO] Updating mediaSession.")

        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            album: song.albums ? song.albums[0]?.title : undefined,
            artist: song.artists.map((a) => a.name).join(", "),
            artwork: [
                { src: song.artwork ? `${environment.api_base_uri}/v1/artworks/${song.artwork.id}` : "/assets/img/missing_cover.png" }
            ]
        })

        navigator.mediaSession.setActionHandler("nexttrack", () => this.next())
        navigator.mediaSession.setActionHandler("play", () => this.play())
        navigator.mediaSession.setActionHandler("pause", () => this.pause())
        navigator.mediaSession.setActionHandler("stop", () => this.pause())
        navigator.mediaSession.setActionHandler("previoustrack", () => this.prev())
    }

    private onError(event: Event) {
        this._loadingSubject.next(false);
        this.pause();

        const error = event.currentTarget["error"] as MediaError;
        if(!error) return;

        if(error.code == 2) {
            console.error("[AUDIO] Cannot play audio: Network Error")
            this.showError("Das Lied kann nicht abgespielt werden: Bitte überprüfe deine Internetverbindung")
        } else if(error.code == 3) {
            console.error("[AUDIO] Error occured whilst decoding audio.")
            this.showError("Es ist ein Fehler beim dekodieren aufgetreten.")
        } else if(error.code == 1) {
            console.warn("[AUDIO] Could not play audio because it was aborted.")
        } else if(error.code == 4 && !this.audio.src.includes("null")) {
            console.error("[AUDIO] Cannot play song, because the src is not supported")
            this.showError("Das Lied kann nicht abgespielt werden.")
        } else {
            if(error.code == 4) return;
            this.showError("Das Lied kann nicht abgespielt werden.")
        }
    }
    private onLoadStart() {
        this._loadingSubject.next(true)
    }
    private onLoadEnd() {
        this._errorSubject.next(null)
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
        // localStorage?.setItem(PLAYER_VOLUME_KEY, `${this.audio.volume}`)
        // this._volumeSubject.next(this.audio.volume)
    }
    private onEnded() {
        this.next();
    }

    private showError(message: string) {
        this._snackBar.open(message, null, { duration: 3000, panelClass: ["bg-primary", "bg-opacity-90", "backdrop-blur-sm", "text-white-dark", "border-2", "border-primary-light", "bottom-1/2"]})
    }

}