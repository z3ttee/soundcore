import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'asc-accentradial',
  templateUrl: './accentradial.component.html',
  styleUrls: ['./accentradial.component.scss']
})
export class AccentradialComponent implements OnInit {

  /*private _color: string;

  @HostBinding("attr.bg")
  @Input() public set color(value: string) {
    this._color = value || "#FFCD69";
    this.sanatizer.bypassSecurityTrustStyle(`--accent-color: ${this._color}`)
  }

  public get color(): string {
    return this._color
  }*/

  @Input() public color: string = "#FFCD69";

  constructor(private sanatizer: DomSanitizer) { }

  ngOnInit(): void {
  }

}
