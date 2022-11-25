import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Song } from "@soundcore/sdk";
import { combineLatest, map, Observable, Subject, takeUntil, tap } from "rxjs";
import { AppControlsService } from "../../services/controls.service";
import { AppPlayerService } from "../../services/player.service";

interface PlayerbarProps {
    song?: Song;
    currentTime?: number;
    playing?: boolean;
    responsive?: ResponsiveOptions;
}

interface ResponsiveOptions {
    showDuration: boolean;
    showMaximize: boolean;
    showHistoryControls: boolean;
    reducedMode: boolean;
}

@Component({
    selector: "scngx-player-bar",
    templateUrl: "./player-bar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppPlayerBarComponent implements OnDestroy, AfterViewInit {

    @ViewChild("scngxPlayerContainer") private readonly container: ElementRef<HTMLDivElement>;

    public readonly seekInputControl: FormControl<number> = new FormControl(0);

    /**
     * Subject to notify subscriptions about destroying themselves.
     */
    private readonly _destroy: Subject<void> = new Subject();

    private readonly _responsiveness: Subject<ResponsiveOptions> = new Subject();
    private readonly $responsiveness: Observable<ResponsiveOptions> = this._responsiveness;

    /**
     * ResizeObserver to observe viewport width changes.
     * This is used to trigger specific elements from becoming
     * hidden.
     */
    private _observer: ResizeObserver;

    constructor(
        public readonly player: AppPlayerService,
        public readonly controls: AppControlsService
    ) {}

    public $props: Observable<PlayerbarProps> = combineLatest([
        this.player.$current.pipe(takeUntil(this._destroy)),
        this.player.$currentTime.pipe(takeUntil(this._destroy)),
        this.controls.$isPaused.pipe(takeUntil(this._destroy)),
        this.$responsiveness.pipe(takeUntil(this._destroy))
    ]).pipe(
        map(([currentItem, currentTime, isPaused, responsiveness]): PlayerbarProps => ({
            song: currentItem?.song,
            currentTime: currentTime ?? 0,
            playing: !isPaused,
            responsive: responsiveness
        })),
        tap((props) => {
            this.seekInputControl.setValue(props.currentTime);
        })
    );

    public ngAfterViewInit(): void {
        // Create ResizeObserver to react on viewport width changes.
        this._observer = new ResizeObserver((entries: ResizeObserverEntry[], observer: ResizeObserver) => {
            const width = this.container.nativeElement.getBoundingClientRect().width;

            this._responsiveness.next({
                reducedMode: width < 600,
                showDuration: width > 650,
                showHistoryControls: width > 770,
                showMaximize: width > 650
            });
        });
      
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