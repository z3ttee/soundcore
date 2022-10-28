import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'scngx-vertical-grid',
  templateUrl: './vertical-grid.component.html',
  styleUrls: ['./vertical-grid.component.scss']
})
export class SCNGXVerticalGridComponent implements OnInit {

  @Input() public width: string = "180px";
  @Input() public minWidth: string = "1fr";

  constructor() { }

  public ngOnInit(): void {}

}
