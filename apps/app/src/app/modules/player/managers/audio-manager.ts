import { isNull } from "@soundcore/common";
import Hls from "hls.js";
import { BehaviorSubject, Observable, distinctUntilChanged, from, map, of, switchMap } from "rxjs";

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
    
    private _$onEnded: Observable<void>;

    private _mode: AudioManagerMode = AudioManagerMode.HTML5;

    constructor(forceMode?: AudioManagerMode) {
        this.initialize(forceMode);
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

    public play(url: string): Observable<string> {
        return of(url).pipe(
            switchMap((url) => {
                // Check if mode is not HLS
                if(!this.isHLS) {
                    // If true, play audio normally 
                    // via HTML5 audio
                    this._audio.src = url;
                    return from(this._audio.play()).pipe(map(() => url));
                }
                
                return this.playHLS(url).pipe(map(() => url));
            })
        );
    }

    private playHLS(manifestUrl: string): Observable<any> {
        return new Observable((subscriber) => {
            console.log("play ", manifestUrl);

            subscriber.next();
            subscriber.complete();
        });
    }

    private initialize(forceMode?: AudioManagerMode) {
        if(!isNull(this._hls)) throw new Error("AudioManager already initialized");

        // Set ready state to false
        this._readySubject.next(false);
        // Create HTML5 audio element
        this._audio = new Audio();
        // Set playback mode
        this._mode = forceMode ?? (Hls.isSupported() ? AudioManagerMode.HLS : AudioManagerMode.HTML5);

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
            console.warn(`[${this.LABEL}] Browser does not support HLS for media streaming. Setting mode to '${this._mode.toUpperCase()}'`);
            this.handleInitializedEvent();
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

}