import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'asc-seeker',
  templateUrl: './seeker.component.html',
  styleUrls: ['./seeker.component.scss']
})
export class SeekerComponent implements OnInit {

  @ViewChild("inputElement") public range: ElementRef<HTMLInputElement>;

  @Input() public duration: number;

  @Input() public set current(val: number) {
    if(this.isInputting) return;
    this.value = val;
    this.updateProgress();
  }

  @Input() public steps: number = 1;

  @Output() public seek: EventEmitter<number> = new EventEmitter();

  public get current(): number { return this.value }

  public value: number = 0;
  private isInputting: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.value = this.current;
    this.updateProgress();
  }

  public onInputChanged(event: Event) {
    this.isInputting = false;
    this.seek.emit(parseInt(event.target["value"]));
  }

  public onInput() {
    this.isInputting = true;

    this.updateProgress();
  }

  public updateProgress() {
    if(!this.range?.nativeElement) return;

    const max = parseInt(this.range.nativeElement.max);
    const val = parseInt(this.range.nativeElement.value);
    // let progress = parseFloat((val/max * 100 ).toFixed(2));
    let progress = (val/max * 100 )

    // This is done so the track doesnt lag behind the thumb
    if(progress <= 40) progress += 0.5;
    
    this.range.nativeElement.style.backgroundSize = progress + '% 100%';
  }


}
