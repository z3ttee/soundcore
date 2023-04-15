import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Observable, combineLatest, map } from "rxjs";
import { PlayerService } from "src/app/modules/player/services/player.service";
import { AudioQueue } from "src/app/modules/player/services/queue.service";

interface QueueHistoryProps {
    
}

@Component({
    templateUrl: "./history-view.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueueHistoryViewComponent {

    constructor(
        private readonly queue: AudioQueue,
        private readonly player: PlayerService
    ) {}

    public $props: Observable<QueueHistoryProps> = combineLatest([
        this.queue.$queue,
        this.player.$currentItem
    ]).pipe(
        map(([queue, current]): QueueHistoryProps => ({
            
        }))
    )

}