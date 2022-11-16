import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Song } from "@soundcore/sdk";
import { BehaviorSubject, debounce, debounceTime, Subject, takeUntil } from "rxjs";
import { AppControlsService } from "../../services/controls.service";
import { AppPlayerService } from "../../services/player.service";

@Component({
    selector: "scngx-player-bar",
    templateUrl: "./player-bar.component.html"
})
export class AppPlayerBarComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild("scngxPlayerContainer") private readonly container: ElementRef<HTMLDivElement>;

    public readonly seekInputControl: FormControl<number> = new FormControl(0);

    /**
     * Subject to notify subscriptions about destroying themselves.
     */
    private readonly _destroy: Subject<void> = new Subject();

    /**
     * ResizeObserver to observe viewport width changes.
     * This is used to trigger specific elements from becoming
     * hidden.
     */
    private _observer: ResizeObserver;

    public showMaximize: boolean = true;
    public showHistoryControls: boolean = true;
    public showDuration: boolean = true;
    public reducedMode: boolean = false;

    /**
     * Current song state
     */
    public song?: Song;

    /**
     * Current time of the audio src.
     */
    public currentTime: number = 0;

    /**
     * Pause-State of playback
     */
    public isPaused: boolean = true;

    public seekTime: number = 0;

    constructor(
        public readonly player: AppPlayerService,
        public readonly controls: AppControlsService
    ) {}

    public ngOnInit(): void {
        // Subscribe to changes on currently playing item
        this.player.$current.pipe(takeUntil(this._destroy)).subscribe((current) => {
            // Update internal song state to new playing item
            this.song = current?.song;
        });

        // Subscribe to current time changes
        this.player.$currentTime.pipe(takeUntil(this._destroy)).subscribe((currentTime) => {
            // Update internal current time state
            this.currentTime = currentTime ?? 0;
            this.seekInputControl.setValue(this.currentTime)
        });

        // Subscribe to pause state changes
        this.controls.$isPaused.pipe(takeUntil(this._destroy)).subscribe((isPaused) => {
            // Update pause state
            this.isPaused = isPaused;
        });

        this.seekInputControl.valueChanges.pipe(takeUntil(this._destroy), debounceTime(10)).subscribe((value) => {
            // console.log(value);
            // this.controls.seek(value);
        })
    }

    public ngAfterViewInit(): void {
        // Create ResizeObserver to react on viewport width changes.
        this._observer = new ResizeObserver((entries: ResizeObserverEntry[], observer: ResizeObserver) => {
            const width = this.container.nativeElement.getBoundingClientRect().width;
      
            this.showMaximize = width > 650;
            this.showHistoryControls = width > 770;
            this.showDuration = width > 650;
            this.reducedMode = width < 600;
        })
      
        // Observe current component's html ref
        this._observer.observe(this.container.nativeElement);
    }

    public ngOnDestroy(): void {
        // Notify subscriptions to destroy themselves
        this._destroy.next();
        this._destroy.complete();

        // Disconnect resize observer from component's html ref
        this._observer.disconnect();
    }

    public onSeek(value: number) {
        this.controls.seek(value);
    }
}