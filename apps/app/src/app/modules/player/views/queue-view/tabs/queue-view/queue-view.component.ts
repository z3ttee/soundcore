import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { Song } from "@soundcore/sdk";
import { Observable, Subject, combineLatest, map, takeUntil } from "rxjs";
import { AUDIOWAVE_LOTTIE_OPTIONS } from "src/app/constants";
import { SCNGXTracklist } from "src/app/modules/player/entities/tracklist.entity";
import { PlayerService, Streamable } from "src/app/modules/player/services/player.service";
import { AudioQueue } from "src/app/modules/player/services/queue.service";

interface QueueViewProps {
    tracks?: Song[];
    enqueuedTracklist?: SCNGXTracklist;
    tracklistQueue?: Song[];

    current?: Streamable;
    isPlaying?: boolean;
}

@Component({
    templateUrl: "./queue-view.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueueViewComponent implements OnDestroy {

    private readonly $destroy: Subject<void> = new Subject();

    // Lottie animations options
    public animOptions = AUDIOWAVE_LOTTIE_OPTIONS;

    constructor(
        private readonly queue: AudioQueue,
        private readonly player: PlayerService
    ) {}

    public $props: Observable<QueueViewProps> = combineLatest([
        this.queue.$queue,
        this.player.$currentItem,
        this.player.$isPaused,
    ]).pipe(
        map(([combinedQueue, current, isPaused]): QueueViewProps => {
            let queue = combinedQueue[0];
            let tracklist = combinedQueue[1];

            return {
                tracks: [...(queue ?? [])],
                enqueuedTracklist: tracklist,
                tracklistQueue: [...(tracklist?.queue ?? [])],
                current: current,
                isPlaying: !isPaused
            }
        }),
        takeUntil(this.$destroy)
    )

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

    public togglePlaying() {
        this.player.togglePlaying().pipe(takeUntil(this.$destroy)).subscribe();
    }

}