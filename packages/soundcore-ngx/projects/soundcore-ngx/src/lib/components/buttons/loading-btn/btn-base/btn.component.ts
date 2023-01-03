import { Component, Input, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'scngx-lbtn',
  templateUrl: './btn.component.html',
  styleUrls: ['./btn.component.scss']
})
export class SCNGXLoadingBtnBaseComponent implements OnInit {

  @Input() public appearance: "error" | "success" | "warn" | "info" | "default" = "default";
  @Input() public size: "sm" | "base" | "md" | "lg" | "xl" = "base";
  @Input() public fullWidth: boolean = false;
  @Input() public loading: boolean = false;
  @Input() public disabled: boolean = false;

  options: AnimationOptions = {
    path: '/assets/animated/loader_light.json',
  };

  constructor() { }

  ngOnInit(): void {
  }

}
