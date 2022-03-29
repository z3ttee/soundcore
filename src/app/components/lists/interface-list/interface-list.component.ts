import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'asc-interface-list',
  templateUrl: './interface-list.component.html',
  styleUrls: ['./interface-list.component.scss']
})
export class AscInterfaceListComponent implements OnInit {

  @Input() public currentPage: number = 0;
  @Input() public pageSize: number = 30;
  @Input() public currentSize: number = 0;
  @Input() public totalElements: number = 0;

  @Output() public onMore: EventEmitter<void> = new EventEmitter();

  constructor() { }

  public ngOnInit(): void {}

}
