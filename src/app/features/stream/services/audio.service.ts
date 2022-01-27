import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BehaviorSubject, filter, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Song } from "../../song/entities/song.entity";
import { StreamQueueService } from "./queue.service";
import { StreamService } from "./stream.service";

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
    public async play(song?: Song) {
        if(song) {
            this.audio.src = await this.streamService.getStreamURL(song);
            this._currentSongSubject.next(song);
        }
        
        this.audio.play().catch(() => {
            this.showError("Das Lied kann nicht abgespielt werden.")
        });
    }


    /**
     * Play next song in queue.
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

    public async prev() {

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
        this.audio.src = null;
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

        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            album: song.albums ? song.albums[0]?.title : undefined,
            artist: song.artists.map((a) => a.name).join(", "),
            artwork: [
                { src: song.artwork ? `${environment.api_base_uri}/v1/artworks/${song.artwork.id}` : "/assets/img/missing_cover.png" }
            ]
        })

        navigator.mediaSession.setActionHandler("nexttrack", () => this.next())
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
        this._volumeSubject.next(this.audio.volume)
    }
    private onEnded() {
        this.next();
    }


    private showError(message: string) {
        this._snackBar.open(message, null, { duration: 3000, panelClass: ["bg-primary", "bg-opacity-90", "backdrop-blur-sm", "text-white-dark", "border-2", "border-primary-light", "bottom-1/2"]})
    }

}