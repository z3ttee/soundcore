import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject, takeUntil } from 'rxjs';
import { DeviceService } from 'src/app/services/device.service';

@Component({
  selector: 'asc-like-button',
  templateUrl: './like-button.component.html',
  styleUrls: ['./like-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AscLikeButtonComponent implements OnInit, OnDestroy {
  
  // @Output() public click: EventEmitter<void> = new EventEmitter();

  constructor(
    private deviceService: DeviceService
  ) { }

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private _isLikedSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private $destroy: Observable<void> = this._destroySubject.asObservable();
  public $isLiked: Observable<boolean> = this._isLikedSubject.asObservable().pipe(takeUntil(this.$destroy))
  public $isDesktop: Observable<boolean> = this.deviceService.$breakpoint.pipe(takeUntil(this.$destroy), map((bp) => bp?.isDesktop))

  // Component props
  @Input() public set isLiked(val: boolean){ this._isLikedSubject.next(val); }

  public ngOnInit(): void {
    this.$isLiked.subscribe((liked) => {
      console.log(liked)
    })
  }
  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

}
