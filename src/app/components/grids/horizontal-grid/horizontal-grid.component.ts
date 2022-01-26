import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'asc-horizontal-grid',
  templateUrl: './horizontal-grid.component.html',
  styleUrls: ['./horizontal-grid.component.scss']
})
export class HorizontalGridComponent implements OnInit {

  @ViewChild("scrollArea") public scrollArea: ElementRef<HTMLDivElement>;
  @ViewChild("container") public container: ElementRef<HTMLDivElement>;


  @Input() public headline: string;
  @Input() public enableMore: boolean = false;
  @Input() public canScroll: boolean = true;
  @Input() public customMoreText: string = "Alles anzeigen"

  @Output() public more: EventEmitter<void> = new EventEmitter();

  public canGoPrev: boolean = false;
  public canGoNext: boolean = false;

  constructor() { }

  public ngOnInit(): void {
    
  }

  public onScroll(event: Event) {
    const scrollLeft: number = parseInt(event.target["scrollLeft"]);
    //console.log(this.scrollArea.nativeElement.scrollLeft + this.scrollArea.nativeElement.offsetWidth, this.scrollArea.nativeElement.scrollWidth)
    //console.log((this.scrollArea.nativeElement.scrollLeft + this.scrollArea.nativeElement.offsetWidth) < this.scrollArea.nativeElement.scrollWidth)
    
  }

  public scrollNext() {
    const scrollAmount = this.container.nativeElement.getBoundingClientRect().width;
    this.scrollArea.nativeElement.scrollLeft += scrollAmount;
  }

  public scrollPrev() {
    const scrollAmount = this.container.nativeElement.getBoundingClientRect().width;
    this.scrollArea.nativeElement.scrollLeft -= scrollAmount;
  }

  public onMore() {
    this.more.emit();
  }

}
