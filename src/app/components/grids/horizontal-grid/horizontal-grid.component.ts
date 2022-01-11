import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'asc-horizontal-grid',
  templateUrl: './horizontal-grid.component.html',
  styleUrls: ['./horizontal-grid.component.scss']
})
export class HorizontalGridComponent implements OnInit {

  @Input() public headline: string;
  @Input() public enableMore: boolean = false;
  @Input() public canScroll: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

}
