import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { DeviceService } from 'src/app/services/device.service';

@Component({
  selector: 'asc-play-button',
  templateUrl: './play-button.component.html',
  styleUrls: ['./play-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AscPlayButtonComponent implements OnInit, OnDestroy {

  @Input() public isPaused: boolean = true;
  @Output() public click: EventEmitter<void> = new EventEmitter();

  constructor(
    private deviceService: DeviceService
  ) { }

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  public $isDesktop: Observable<boolean> = this.deviceService.$breakpoint.pipe(takeUntil(this.$destroy), map((bp) => bp?.isDesktop))

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

}
