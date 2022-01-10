import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'asc-seeker',
  templateUrl: './seeker.component.html',
  styleUrls: ['./seeker.component.scss']
})
export class SeekerComponent implements OnInit {

  @ViewChild("inputElement") public range: HTMLInputElement;

  @Input() public duration: number;

  @Input() public set current(val: number) {
    if(this.isInputting) return;
    this.value = val;
  }

  @Input() public steps: number = 1;

  @Output() public seek: EventEmitter<number> = new EventEmitter();

  public get current(): number { return this.value }

  public value: number = 0;
  private isInputting: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.value = this.current;
  }

  public onInputChanged(event: Event) {
    this.isInputting = false;
    this.seek.emit(parseInt(event.target["value"]));
  }

  public onInput() {
    this.isInputting = true;
  }


}
