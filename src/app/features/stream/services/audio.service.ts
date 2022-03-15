import { Injectable } from "@angular/core";
import { BehaviorSubject, filter, interval, Observable, skip, takeUntil, timer } from "rxjs";
import { SettingsService } from "src/app/services/settings.service";
import { SnackbarService } from "src/app/services/snackbar.service";
import { environment } from "src/environments/environment";
import { PlayableList } from "src/lib/data/playable-list.entity";
import { Song } from "../../song/entities/song.entity";
import { CurrentPlayingItem } from "../entities/current-item.entity";
import { QueueItem, QueueList } from "../entities/queue-item.entity";
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
    private isCurrentlyFading: boolean = false;

    private _currentItemSubject: BehaviorSubject<CurrentPlayingItem> = new BehaviorSubject(null);
    private _pausedSubject: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);
    private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);
    private _currentTimeSubject: BehaviorSubject<number> = new BehaviorSubject(0);
    private _volumeSubject: BehaviorSubject<number> = new BehaviorSubject(this.getRestoredVolume());
    private _doneSubject: BehaviorSubject<boolean> = new BehaviorSubject(true as boolean);
    private _loopSubject: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);
    private _shuffleSubject: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);
    private _errorSubject: BehaviorSubject<string> = new BehaviorSubject(null);

    public $currentItem: Observable<CurrentPlayingItem> = this._currentItemSubject.asObservable();
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

    public get currentItem(): CurrentPlayingItem {
        return this._currentItemSubject.getValue();
    }

    public get canPlayNext(): boolean {
        return this._doneSubject.getValue();
    }

    constructor(
        private streamService: StreamService,
        private queueService: StreamQueueService,
        private snackbarService: SnackbarService,
        private settingsService: SettingsService
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
        this.audio.onended = () => this.onEnded();
        this.audio.onerror = (event: Event) => this.onError(event);

        this.$paused.subscribe(() => {
            this.setSession(this._currentItemSubject.getValue());
        })

        this.queueService.$onQueueWaiting.subscribe((item) => this.onQueueWaiting(item))
    }

    /**
     * Handle event when a new item was added to queue.
     * @param item Item
     */
    private onQueueWaiting(item: QueueItem) {
        if(!this.canPlayNext) return

        this._doneSubject.next(false);
        this.next();
    }

    /**
     * Continue playing a song or provide a song object
     * to force play a new song.
     */
    private async play(item?: CurrentPlayingItem, fadeIn: boolean = false) {
        if(this.isCurrentlyFading) return;

        if(item) {
            const token = await this.streamService.getTokenForSong(item.song).catch((error) => {
                console.error(error);
                this.showError("Das Lied kann nicht abgespielt werden.")
                return null;
            });

            if(!token) return;
            this.audio.src = await this.streamService.getStreamURL(token);
            this._currentItemSubject.next(item);
        }

        if(!fadeIn || !this.settingsService.isAudioFadeAllowed()) this.audio.volume = this._volumeSubject.getValue();
        this.audio.play().then(() => {
            if(fadeIn && this.settingsService.isAudioFadeAllowed()) this.fadeInAudio(FADE_AUDIO_TOGGLE_MS);
        }).catch(() => {
            this.showError("Das Lied kann nicht abgespielt werden.")
        });
    }

    /**
     * Pause the playing audio
     */
     public pause(fadeOut: boolean = false) {
        if(this.isCurrentlyFading) return;

        if(!fadeOut || !this.settingsService.isAudioFadeAllowed()) {
            this.audio.pause();
            return;
        }

        this.fadeOutAudio(FADE_AUDIO_TOGGLE_MS).then(() => this.audio.pause());
    }

    /**
     * Force play of the selected list.
     */
     private async playList(list: PlayableList<any>) {
        console.log("force play")
        const item = new QueueList(list);
        
        this.queueService.enqueueListTop(list)

        // this._currentItemSubject.next();
        // this.enqueueList(playableList)
    }

    /**
     * Force play the selected list. If the list is already 
     * playing then the playback is paused or resumed.
     * @param list Song to play
     */
    public async playOrPause(song: Song) {
        const isPlaying = this.currentItem?.id == song?.id

        if(isPlaying) this.togglePause();
        else this.play(new CurrentPlayingItem(song));
    }

    /**
     * Force play the selected list. If the list is already 
     * playing then the playback is paused or resumed.
     * @param list List to play
     */
    public async playOrPauseList(list: PlayableList<any>) {
        const isPlaying = this.currentItem?.context?.id == list.id

        if(isPlaying) this.togglePause();
        else this.playList(list);
    }

    /**
     * Pause or resume playback.
     */
    public async togglePause() {
        if(this.paused) this.play(null, true);
        else this.pause(true);
    }

    /**
     * Fade in audio from the currently playing audio element.
     * @param fadeDuration Duration
     * @returns void - Resolves after the fading has ended.
     */
    public async fadeInAudio(fadeDuration: number) {
        this.isCurrentlyFading = true;
        return new Promise<void>((resolve) => {
            this.audio.volume = 0;
            const dstVolume = this._volumeSubject.getValue();
            this.calculateVolumeIncAndDelay(dstVolume, fadeDuration).then((result) => {
                const volumeInc = result[0];
                const delay = result[1];
                
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
        }).finally(() => {
            this.isCurrentlyFading = false;
        })
    }

    /**
     * Fade out audio from the currently playing audio element.
     * @param fadeDuration Duration
     * @returns void - Resolves after the fading has ended.
     */
    public async fadeOutAudio(fadeDuration: number) {
        this.isCurrentlyFading = true;
        this._pausedSubject.next(true);

        return new Promise<void>((resolve) => {
            this.calculateVolumeIncAndDelay(this.audio.volume, fadeDuration).then((result) => {
                const volumeInc = result[0];
                const delay = result[1];

                const subscription = interval(delay).pipe(takeUntil(this.$paused.pipe(filter((paused) => !paused)))).subscribe(() => {               
                    if(this.audio.volume - volumeInc <= 0) {
                        this.audio.volume = 0;
                        resolve();
                        subscription.unsubscribe();
                        return;
                    }
    
                    this.audio.volume -= volumeInc;
                })
            })
        }).finally(() => {
            this.isCurrentlyFading = false;
        })
    }

    /**
     * Get calculated delay and volume increment for fading audio.
     * @param startVolume Value the equation will be based on.
     * @param totalDuration Duration
     * @returns [volumeInc, delay]
     */
    private async calculateVolumeIncAndDelay(startVolume: number, totalDuration: number): Promise<[number, number]> {
        const delay = totalDuration / 100;
        const volumeInc = (startVolume / totalDuration) * delay;

        return [volumeInc, delay];
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
        this.queueService.enqueueSong(song);
        this.snackbarService.info("Song zur Warteschlange hinzugefügt.")
    }

    public async enqueueList(list: PlayableList<any>) {
        this.queueService.enqueueList(list);
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

    private async setSession(currentItem: CurrentPlayingItem) {
        const song = currentItem?.song;
        if(!song) return;

        if(!currentItem) {
            console.warn("[AUDIO] Cannot update mediaSession: Song is null")
            return;
        }

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
            ],
            
        })

        navigator.mediaSession.setActionHandler("nexttrack", () => this.next())
        navigator.mediaSession.setActionHandler("play", () => this.play(null, true))
        navigator.mediaSession.setActionHandler("pause", () => this.pause(true))
        navigator.mediaSession.setActionHandler("stop", () => this.pause(true))
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
    private onEnded() {
        this.next();
    }

    private showError(message: string) {
        this.snackbarService.error(message);
        // this._snackBar.open(message, null, { duration: 3000, panelClass: ["bg-primary", "bg-opacity-90", "backdrop-blur-sm", "text-white-dark", "border-2", "border-primary-light", "bottom-1/2"]})
    }

}