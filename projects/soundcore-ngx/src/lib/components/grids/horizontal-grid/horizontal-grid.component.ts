import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { debounceTime, fromEvent, Subject, takeUntil } from 'rxjs';
import { SCCDKScreenService } from 'soundcore-cdk';

@Component({
  selector: 'scngx-horizontal-grid',
  templateUrl: './horizontal-grid.component.html',
  styleUrls: ['./horizontal-grid.component.scss']
})
export class SCNGXHorizontalGridComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly _destroy: Subject<void> = new Subject();

  @ViewChild("scroller") public scrollerRef: ElementRef<HTMLDivElement>;

  public showNext: boolean = false;
  public showPrev: boolean = false;
  public isTouch: boolean = false;

  private observer: ResizeObserver;

  constructor(
    private readonly screenService: SCCDKScreenService,
    private readonly elementRef: ElementRef<HTMLElement>
  ) { }

  @ViewChild("container") public container: ElementRef<HTMLElement>;

  public ngOnInit(): void {
    this.observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      this.checkControlButtons();
    })

    this.observer.observe(this.elementRef.nativeElement);

    this.screenService.$isTouch.pipe(takeUntil(this._destroy)).subscribe((isTouch) => this.isTouch = isTouch)
  }

  public ngOnDestroy(): void {
      this.observer.disconnect();

      this._destroy.next();
      this._destroy.complete();
  }

  public ngAfterViewInit(): void {
      this.observer.observe(this.scrollerRef.nativeElement);

      fromEvent(this.scrollerRef.nativeElement, "scroll").pipe(debounceTime(100), takeUntil(this._destroy)).subscribe((event) => {
          this.checkControlButtons();
      })
  }

  public scrollPrev() {
    if(!this.scrollerRef.nativeElement) return;
    const scrollAmount = this.container.nativeElement.getBoundingClientRect().width;
    this.scrollerRef.nativeElement.scrollLeft -= scrollAmount;
  }

  public scrollNext() {
    if(!this.scrollerRef.nativeElement) return;
    const scrollAmount = this.container.nativeElement.getBoundingClientRect().width;
    this.scrollerRef.nativeElement.scrollLeft += scrollAmount;
  }

  private checkControlButtons() {
    if(!this.scrollerRef.nativeElement){
      this.showNext = false;
      this.showPrev = false;
    }

    this.showPrev = this.scrollerRef.nativeElement.scrollLeft > 0;
    this.showNext = this.scrollerRef.nativeElement.scrollLeft + this.scrollerRef.nativeElement.offsetWidth < this.scrollerRef.nativeElement.scrollWidth;    
  }

}
