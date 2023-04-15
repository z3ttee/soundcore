import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Observable, combineLatest, map } from "rxjs";
import { PlayerService, Streamable } from "src/app/modules/player/services/player.service";
import { AudioQueue, EnqueuedItem } from "src/app/modules/player/services/queue.service";

interface QueueViewProps {
    queue?: EnqueuedItem[];
    current?: Streamable;
}

@Component({
    templateUrl: "./queue-view.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueueViewComponent {

    constructor(
        private readonly queue: AudioQueue,
        private readonly player: PlayerService
    ) {}

    public $props: Observable<QueueViewProps> = combineLatest([
        this.queue.$queue,
        this.player.$currentItem
    ]).pipe(
        map(([queue, current]): QueueViewProps => ({
            queue: queue,
            current: current
        }))
    )

}