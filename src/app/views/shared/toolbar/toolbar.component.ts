import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'asc-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Input() public withMenu: boolean = true;
  @Output() public onMenuToggle: EventEmitter<void> = new EventEmitter()

  constructor() { }

  ngOnInit(): void {
  }

  public emitMenuToggle(): void {
    this.onMenuToggle.emit();
  }

}
