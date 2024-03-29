import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'scngx-btn',
  templateUrl: './btn.component.html',
  styleUrls: ['./btn.component.scss']
})
export class SCNGXBtnBaseComponent implements OnInit {

  @Input() public appearance: "error" | "success" | "warn" | "info" | "default" = "default";
  @Input() public size: "sm" | "base" | "md" | "lg" | "xl" = "base";
  @Input() public fullWidth: boolean = false;
  @Input() public disabled: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
