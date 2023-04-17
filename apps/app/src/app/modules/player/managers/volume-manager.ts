import { isNull } from "@soundcore/common";
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, skip } from "rxjs";
import { DEFAULT_VOLUME, LOCALSTORAGE_KEY_VOLUME } from "src/app/constants";

export class VolumeManager {
    private readonly defaultVolume;

    private readonly volume: BehaviorSubject<number> = new BehaviorSubject(this.read());
    private readonly mute: BehaviorSubject<boolean> = new BehaviorSubject(false);

    public readonly $volume = this.volume.asObservable().pipe(
        map((val) => val * 100),
        distinctUntilChanged()
    );
    public readonly $muted = combineLatest([
        this.volume.asObservable(),
        this.mute.asObservable()
    ]).pipe(
        map(([volume, isMuted]) => volume <= 0 || isMuted), 
        distinctUntilChanged()
    )
    
    constructor(
        private readonly audio: HTMLAudioElement,
        defaultVolume: number = DEFAULT_VOLUME
    ) {
        this.defaultVolume = (defaultVolume ?? DEFAULT_VOLUME) / 100;
        this.audio.volume = Math.max(0, Math.min(1, this.read()));

        this.$volume.pipe(skip(1), debounceTime(300)).subscribe((vol) => {
            this.persist(vol);
        });
    }

    public setVolume(volume: number) {
        this.audio.volume = Math.max(0, Math.min(100, (volume / 100)));
        this.volume.next(this.audio.volume)
    }

    public toggleMute() {
        const isMuted = this.mute.getValue();

        if(isMuted) {
            // Reset to previous volume and
            // push new muted state
            this.audio.volume = this.volume.getValue();
            this.mute.next(false);
            return;
        }
        
        // Otherwise set volume to 0 and
        // push new muted state
        this.audio.volume = 0;
        this.mute.next(true);
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