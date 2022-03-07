import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject, takeUntil } from 'rxjs';
import { DeviceService } from 'src/app/services/device.service';

@Component({
  selector: 'asc-play-button',
  templateUrl: './play-button.component.html',
  styleUrls: ['./play-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AscPlayButtonComponent implements OnInit, OnDestroy {

  constructor(
    private deviceService: DeviceService
  ) { }

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private _pausedSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private $destroy: Observable<void> = this._destroySubject.asObservable();
  public $isPaused: Observable<boolean> = this._pausedSubject.asObservable();
  public $isDesktop: Observable<boolean> = this.deviceService.$breakpoint.pipe(takeUntil(this.$destroy), map((bp) => bp?.isDesktop))

  @Input() public set isPaused(val: boolean) { this._pausedSubject.next(val) };
  @Input() public mode: "md" | "lg" = "md";

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

}
