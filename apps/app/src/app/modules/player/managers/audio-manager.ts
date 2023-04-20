import { isNull } from "@soundcore/common";
import Hls, { ManifestParsedData } from "hls.js";
import { BehaviorSubject, Observable, Subject, distinctUntilChanged, from, map, of, switchMap } from "rxjs";

export enum AudioManagerMode {
    HLS = "hls",
    HTML5 = "html5"
};

export class AudioManager {
    private readonly LABEL: string = "AudioManager"

    /**
     * Instance of the HTML5 Audio element
     */
    private _audio: HTMLAudioElement;
    /**
     * HLS Player instance
     */
    private _hls: Hls;

    private readonly _readySubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    
    /**
     * Emits current ready state. The manager will emit ready, when
     * the player was initialized and play-request can be issued
     */
    public readonly $ready = this._readySubject.asObservable().pipe(distinctUntilChanged());
    
    private readonly onEnded: Subject<void> = new Subject();
    public readonly $onEnded = this.onEnded.asObservable();

    private readonly isPaused: BehaviorSubject<boolean> = new BehaviorSubject(true);
    public readonly $isPaused = this.isPaused.asObservable().pipe(distinctUntilChanged());

    private readonly currenTime: BehaviorSubject<number> = new BehaviorSubject(0);
    public readonly $currenTime = this.currenTime.asObservable().pipe(distinctUntilChanged());

    private _mode: AudioManagerMode = AudioManagerMode.HTML5;

    constructor(forceMode?: AudioManagerMode) {
        this.initialize(forceMode);
        this.registerEvents();
    }

    /**
     * Current mode of the 
     * audio manager
     */
    public get mode() {
        return this._mode;
    }

    /**
     * Check if the manager runs
     * in HLS mode
     */
    public get isHLS() {
        return this._mode === AudioManagerMode.HLS;
    }

    /**
     * Get instance of the HTML5 Audio element
     */
    public get audioElement() {
        return this._audio;
    }

    /**
     * Seek on the track
     * @param seconds Second to seek
     */
    public seek(seconds: number) {
        this._audio.currentTime = seconds;
    }

    public play(url: string): Observable<string> {
        return of(url).pipe(
            switchMap((url) => {
                // Check if mode is not HLS
                if(!this.isHLS || !this.isM3u8Url(url)) {
                    // If true, play audio normally 
                    // via HTML5 audio
                    this._audio.src = url;
                    return from(this._audio.play()).pipe(map(() => url));
                }
                
                return this.playHLS(url);
            })
        );
    }

    private isM3u8Url(url: string): boolean {
        return new URL(url).pathname.includes(".m3u8");
    }

    /**
     * Toggle playing or paused state
     * @returns True, if the player is now playing. Otherwise false
     */
    public togglePlaying(): Observable<boolean> {
        return new Observable((subscriber) => {
            if(!this._audio.paused) {
                this._audio.pause();

                subscriber.next(false);
                subscriber.complete();
            } else {
                this._audio.play().finally(() => {
                    subscriber.next(true);
                    subscriber.complete();
                });
            }
        })
    }

    /**
     * Reset the player's currentTime to 0 and optionally
     * pause the playback.
     * @param pause Optionally pause the playback. Defaults to false
     */
    public resetCurrentlyPlaying(pause: boolean = false) {
        this._audio.currentTime = 0;
        if(pause) {
            this._audio.pause();
        }
    }

    private playHLS(manifestUrl: string): Observable<string> {
        return new Observable((subscriber) => {
            console.log("play ", manifestUrl);

            this._hls.loadSource(manifestUrl);

            subscriber.next(manifestUrl);
            subscriber.complete();
        });
    }

    private initialize(forceMode?: AudioManagerMode) {
        if(!isNull(this._hls)) throw new Error("AudioManager already initialized");

        // Set ready state to false
        this._readySubject.next(false);
        // Create HTML5 audio element
        this._audio = new Audio();

        // Check if a mode is force
        if(isNull(forceMode)) {
            // If true,
            // Set playback mode based on
            // if HLS streaming is supported
            if(Hls.isSupported()) {
                this._mode = AudioManagerMode.HLS;
            } else {
                console.warn(`[${this.LABEL}] Browser does not support HLS for media streaming. Setting mode to '${this._mode.toUpperCase()}'`);
                this._mode = AudioManagerMode.HTML5;
            }
        } else {
            // Otherwise set mode to forced mode
            this._mode = forceMode;
        }

        if(this.isHLS) {
            // Create HLS instance
            this._hls = new Hls({});
            // Create event handler function
            const eventHandler = () => {
                this.handleInitializedEvent();
                this._hls.off(Hls.Events.MEDIA_ATTACHED, eventHandler);
            };
            // Listen to MEDIA_ATTACHED event
            this._hls.on(Hls.Events.MEDIA_ATTACHED, eventHandler);
            // Attach hls instance to HTML5 Audio element
            this._hls.attachMedia(this._audio);
        } else {
            this.handleInitializedEvent();
        }
    }

    private registerEvents() {
        this._audio.onended = () => this.onEnded.next();
        this._audio.onplaying = () => this.isPaused.next(false);
        this._audio.onpause = () => this.isPaused.next(true);
        this._audio.ontimeupdate = () => this.currenTime.next(this._audio.currentTime);

        if(this.isHLS) {
            // Register manifest parsed event
            this._hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => this.handleManifestParsedEvent(data));
            this._hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            // try to recover network error
                            console.log('fatal network error encountered, try to recover');
                            this._hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log('fatal media error encountered, try to recover');
                            this._hls.recoverMediaError();
                            break;
                        default:
                            // cannot recover
                            this._hls.destroy();
                            console.log("unrecoverable error");
                            break;
                    }
                }
            });
        }
    }

    /**
     * Handle initialized event.
     * This will set the manager to be ready
     */
    private handleInitializedEvent() {
        console.log(`[${this.LABEL}] Audio Player initialized. Running in '${this._mode.toUpperCase()}' mode`);
        this._readySubject.next(true);
    }

    private handleManifestParsedEvent(data: ManifestParsedData) {
        console.log(data);
    }

}