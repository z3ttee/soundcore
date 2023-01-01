import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { debounceTime, fromEvent, Subject, takeUntil } from 'rxjs';
import { SCCDKScreenService } from '@soundcore/cdk';

@Component({
  selector: 'scngx-horizontal-list',
  templateUrl: './horizontal-list.component.html',
  styleUrls: ['./horizontal-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXHorizontalListComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly _destroy: Subject<void> = new Subject();

  @ViewChild("container") public containerRef: ElementRef<HTMLDivElement>;

  public showNext: boolean = false;
  public showPrev: boolean = false;
  public isTouch: boolean = false;

  constructor(
    private readonly screenService: SCCDKScreenService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  public ngOnInit(): void {
    this.screenService.$isTouch.pipe(takeUntil(this._destroy)).subscribe((isTouch) => this.isTouch = isTouch)
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public ngAfterViewInit(): void {
      fromEvent(this.containerRef.nativeElement, "scroll").pipe(debounceTime(100), takeUntil(this._destroy)).subscribe((event) => {
          this.updateControlsVisibility();
      })

      this.updateControlsVisibility();
  }

  public scrollPrev() {
    if(!this.containerRef.nativeElement) return;
    const scrollAmount = this.containerRef.nativeElement.getBoundingClientRect().width;
    const currentLeftScroll = this.containerRef.nativeElement.scrollLeft;
    this.containerRef.nativeElement.scrollTo({ left: currentLeftScroll - scrollAmount });

    this.cdr.detectChanges();
  }

  public scrollNext() {
    if(!this.containerRef.nativeElement) return;
    const scrollAmount = this.containerRef.nativeElement.getBoundingClientRect().width;
    const currentLeftScroll = this.containerRef.nativeElement.scrollLeft;

    this.containerRef.nativeElement.scrollTo({ left: currentLeftScroll + scrollAmount });
    this.cdr.detectChanges();
  }

  private updateControlsVisibility() {
    if(!this.containerRef.nativeElement){
      this.showNext = false;
      this.showPrev = false;
    }

    this.showPrev = this.containerRef.nativeElement.scrollLeft > 0;
    this.showNext = (this.containerRef.nativeElement.scrollLeft + this.containerRef.nativeElement.offsetWidth) < this.containerRef.nativeElement.scrollWidth; 

    this.cdr.detectChanges();
  }

  @HostListener("window:resize", ["$event"])
  public onWindowResize(_: UIEvent) {
    this.updateControlsVisibility();
  }

}
