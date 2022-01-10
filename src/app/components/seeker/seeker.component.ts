import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'asc-seeker',
  templateUrl: './seeker.component.html',
  styleUrls: ['./seeker.component.scss']
})
export class SeekerComponent implements OnInit {

  @Input() public duration: number;
  @Input() public value: number;
  @Input() public steps: number = 1;

  @Output() public valueChange: EventEmitter<number> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  public onInputChanged(event: Event) {
    const val = event.target["value"];
    console.log(event.target["value"]);

    this.valueChange.emit(val);
  }

}
