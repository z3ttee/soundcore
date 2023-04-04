import { isNull } from "@soundcore/common";
import { BehaviorSubject, debounceTime } from "rxjs";
import { DEFAULT_SHUFFLED, LOCALSTORAGE_KEY_SHUFFLED } from "src/app/constants";

export class ShuffleManager {
    private readonly shuffled: BehaviorSubject<boolean> = new BehaviorSubject(this.read());
    public readonly $shuffled = this.shuffled.asObservable();
    
    constructor(
        private readonly defaultShuffled: boolean = DEFAULT_SHUFFLED
    ) {
        this.$shuffled.pipe(debounceTime(300)).subscribe((shuffledState) => this.persist(shuffledState));
    }

    public get isShuffled() {
        return this.shuffled.getValue();
    }

    public toggleShuffled() {
        this.shuffled.next(!this.isShuffled);
    }

    private persist(shuffled: boolean) {
        // Check if localStorage API is supported by browser
        if(isNull(localStorage)) {
            // If not supported, return and print message in console for debugging
            console.log("LocalStorage is not supported by browser. Cannot persist shuffled state.");
            return;
        }

        // Save to localStorage
        localStorage.setItem(LOCALSTORAGE_KEY_SHUFFLED, `${shuffled}`);
    }

    private read(): boolean {
        // Check if localStorage API is supported by browser
        if(isNull(localStorage)) {
            // If not supported, return and print message in console for debugging
            console.log("LocalStorage is not supported by browser. Cannot read shuffled state.");
            return this.defaultShuffled;
        }

        // Read persisted shuffled state
        const shuffled = localStorage.getItem(LOCALSTORAGE_KEY_SHUFFLED);
        // Check if value exists, if not, return default shuffled
        if(isNull(shuffled)) return this.defaultShuffled;
        
        // Return value read from localStorage
        return shuffled === "true";
    }

}