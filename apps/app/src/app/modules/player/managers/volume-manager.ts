import { isNull } from "@soundcore/common";
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, skip } from "rxjs";
import { DEFAULT_VOLUME, LOCALSTORAGE_KEY_VOLUME } from "src/app/constants";

export class VolumeManager {
    private readonly defaultVolume;

    private readonly _volume: BehaviorSubject<number> = new BehaviorSubject(this.read());
    private readonly _mute: BehaviorSubject<boolean> = new BehaviorSubject(false);

    public readonly $volume = this._volume.asObservable().pipe(
        map((val) => val * 100),
        distinctUntilChanged()
    );
    public readonly $muted = combineLatest([
        this._volume.asObservable(),
        this._mute.asObservable()
    ]).pipe(
        map(([volume, isMuted]) => volume <= 0 || isMuted), 
        distinctUntilChanged()
    )
    
    constructor(
        private readonly audio: HTMLAudioElement,
        defaultVolume: number = DEFAULT_VOLUME
    ) {
        this.defaultVolume = (defaultVolume ?? DEFAULT_VOLUME) / 100;
        // this.audio.volume = Math.max(0, Math.min(1, this.volume));

        this.setVolume(this.volume);

        this.$volume.pipe(skip(1), debounceTime(300)).subscribe((vol) => {
            this.persist(vol);
        });
    }

    public get volume() {
        return this._volume.getValue();
    }

    public setVolume(volume: number) {
        let value = volume ?? DEFAULT_VOLUME;
        if(value > 1) {
            value = volume / 100;
        }

        console.log("setting volume:", volume)
        this.audio.volume = Math.max(0, Math.min(1, volume));
        this._volume.next(this.audio.volume)
    }

    public toggleMute() {
        const isMuted = this._mute.getValue();

        if(isMuted) {
            // Reset to previous volume and
            // push new muted state
            this.audio.volume = this._volume.getValue();
            this._mute.next(false);
            return;
        }
        
        // Otherwise set volume to 0 and
        // push new muted state
        this.audio.volume = 0;
        this._mute.next(true);
    }

    private persist(volume: number) {
        // Check if localStorage API is supported by browser
        if(isNull(localStorage)) {
            // If not supported, return and print message in console for debugging
            console.log("LocalStorage is not supported by browser. Cannot persist volume state.");
            return;
        }

        // Save to localStorage
        localStorage.setItem(LOCALSTORAGE_KEY_VOLUME, `${volume/100}`);
    }

    private read(): number {
        // Check if localStorage API is supported by browser
        if(isNull(localStorage)) {
            // If not supported, return and print message in console for debugging
            console.log("LocalStorage is not supported by browser. Cannot read volume state.");
            return this.defaultVolume;
        }

        // Read persisted volume
        const volume = localStorage.getItem(LOCALSTORAGE_KEY_VOLUME);
        // Check if value exists, if not, return default volume
        if(isNull(volume)) return this.defaultVolume;
        
        // Return value read from localStorage
        return Math.max(0, Math.min(100, Number(volume)));
    }

}