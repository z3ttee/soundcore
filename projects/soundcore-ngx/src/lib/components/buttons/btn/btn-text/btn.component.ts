import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'scngx-btn-text',
  templateUrl: './btn.component.html',
  styleUrls: ['./btn.component.scss']
})
export class SCNGXBtnTextComponent implements OnInit {

  @Input() public appearance: "error" | "success" | "warn" | "info" | "default" = "default";
  @Input() public size: "sm" | "base" | "md" | "lg" | "xl" = "base";
  @Input() public fullWidth: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
