import { Component, Input, OnInit } from '@angular/core';

export type StatusIndicatorAppearance = "success" | "warn" | "error" | "none";

@Component({
  selector: 'scngx-status-indicator',
  templateUrl: './status-indicator.component.html',
  styleUrls: ['./status-indicator.component.scss']
})
export class SCNGXStatusIndicatorComponent implements OnInit {

  @Input() public appearance: StatusIndicatorAppearance = "none";
  @Input() public size: "default" | "md" | "lg" = "default";

  constructor() { }

  ngOnInit(): void {
  }

}
