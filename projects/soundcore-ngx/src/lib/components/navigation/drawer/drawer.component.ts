import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'scngx-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss']
})
export class SCNGXDrawerComponent implements OnInit, AfterViewInit {

  constructor() { }

  @ViewChild("toggler") public toggler: ElementRef<HTMLDivElement>;
  @Input() public rail: boolean = false;

  public ngOnInit(): void {}
  public ngAfterViewInit(): void {}

  public toggleRail(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.rail = !this.rail;
  }

  public showToggler() {
    if(!this.toggler.nativeElement) return;
    const element = this.toggler.nativeElement;
    element.style.opacity = `1.0`;
  }
  public hideToggler() {
    if(!this.toggler.nativeElement) return;
    const element = this.toggler.nativeElement;
    element.style.opacity = `0.0`;
  }
  public moveToggler(event: MouseEvent) {
    if(!this.toggler.nativeElement) return;
    const element = this.toggler.nativeElement;
    element.style.top = `${event.clientY}px`;
  }

}
