import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'asc-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent {

  @Input() public withIcon: boolean = true;
  @Input() public mode: "info" | "warn" | "error"

  constructor() { }

}
