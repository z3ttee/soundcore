import { ChangeDetectionStrategy, Component } from "@angular/core";
import { AudioQueue, EnqueuedItem } from "../../services/queue.service";
import { PlayerService, Streamable } from "../../services/player.service";
import { Observable, combineLatest, map } from "rxjs";

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