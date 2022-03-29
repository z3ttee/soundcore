import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'asc-stats-item',
  templateUrl: './stats-item.component.html',
  styleUrls: ['./stats-item.component.scss']
})
export class StatsItemComponent {

  @Input() public title: string;
  @Input() public value: string | number;
  @Input() public max: string | number;
  @Input() public mode: "info" | "success" | "warn" | "error" = "info"

  constructor() { }

}
