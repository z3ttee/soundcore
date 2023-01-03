import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable, Subject, takeUntil } from 'rxjs';
import { SCCDKScreenService } from '@soundcore/cdk';
import { Artist } from '@soundcore/sdk';

@Component({
  selector: 'scngx-artist-list-item',
  templateUrl: './artist-list-item.component.html',
  styleUrls: ['./artist-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXArtistListItemComponent implements OnInit, OnDestroy {

  constructor(
    private readonly screenService: SCCDKScreenService,
    private readonly elementRef: ElementRef,
  ) { }

  private $destroy: Subject<void> = new Subject();

  @Input() public artist: Artist;
  @Input() public index: number;

  @Output() public onContext: EventEmitter<Artist> = new EventEmitter();

  @ViewChild("container") public containerRef: ElementRef<HTMLDivElement>;

  private _hoverSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public $hovering: Observable<boolean> = this._hoverSubject.asObservable().pipe(takeUntil(this.$destroy));
  public $isTouch: Observable<boolean> = this.screenService.$isTouch.pipe(takeUntil(this.$destroy))

  public ngOnInit(): void {
    fromEvent(this.elementRef.nativeElement, "mouseenter").pipe(takeUntil(this.$destroy)).subscribe((event) => {
      this._hoverSubject.next(true);
    })

    fromEvent(this.elementRef.nativeElement, "mouseleave").pipe(takeUntil(this.$destroy)).subscribe((event) => {
      this._hoverSubject.next(false);
    })
  }

  public ngOnDestroy(): void {
      this.$destroy.next();
      this.$destroy.complete();

      this.onContext.complete();
  }

  public emitOnContext(event: MouseEvent) {
    if(this.onContext.observed) {
      this.cancelEvent(event);
    }

    this.onContext.emit(this.artist);
  }

  private cancelEvent(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

}
