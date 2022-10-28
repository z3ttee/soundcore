import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'scngx-progressbar',
  templateUrl: './progressbar.component.html',
  styleUrls: ['./progressbar.component.scss']
})
export class SCNGXProgressbarComponent implements OnInit {

  @Input() public mode: "determinate" | "indeterminate" = "indeterminate";
  @Input() public max: number = 100;
  @Input() public progress: number = 0;
  @Input() public transparent: boolean = false;

  public get calculatedProgress() {
    return (this.progress / this.max) * 100;
  }

  constructor() { }
  public ngOnInit(): void {}

}
