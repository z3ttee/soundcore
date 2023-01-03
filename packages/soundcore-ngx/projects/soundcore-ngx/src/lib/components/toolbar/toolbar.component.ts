import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'scngx-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class SCNGXToolbarComponent implements OnInit {

  @Input() public showNavigation: boolean = true;
  @Input() public transparent: boolean = false;

  constructor(
    private readonly _location: Location
  ) { }

  public ngOnInit(): void {}

  public navigateBack() {
    console.log("navigate")
    this._location.back();
  }

  public navigateNext() {
      this._location.forward();
  }

}
