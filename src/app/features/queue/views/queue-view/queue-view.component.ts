import { Component, OnDestroy, OnInit } from '@angular/core';
import { filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { StreamQueueService } from 'src/app/features/stream/services/queue.service';

@Component({
  selector: 'asc-queue-view',
  templateUrl: './queue-view.component.html',
  styleUrls: ['./queue-view.component.scss']
})
export class QueueViewComponent implements OnInit, OnDestroy {

  constructor(
    private readonly audioService: AudioService,
    private readonly queueService: StreamQueueService
  ) {}

  // Destroy Subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  public $current = this.audioService.$currentItem.pipe(takeUntil(this.$destroy))
  public $currentAsList = this.audioService.$currentItem.pipe(takeUntil(this.$destroy), map((item) => item ? [item.song] : []))
  
  public $songs = this.queueService.$songs.pipe(takeUntil(this.$destroy), map((songs) => songs.map((s) => s.item)));
  public $lists = this.queueService.$lists.pipe(takeUntil(this.$destroy));

  public ngOnInit(): void {

  }

  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

}
