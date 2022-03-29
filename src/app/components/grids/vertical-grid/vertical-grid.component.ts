import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'asc-vertical-grid',
  templateUrl: './vertical-grid.component.html',
  styleUrls: ['./vertical-grid.component.scss']
})
export class VerticalGridComponent implements OnInit {

  @Input() public headline: string;
  @Input() public showMore: boolean = true;
  @Input() public customMoreText: string = "Alles anzeigen"

  @Output() public onMore: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
