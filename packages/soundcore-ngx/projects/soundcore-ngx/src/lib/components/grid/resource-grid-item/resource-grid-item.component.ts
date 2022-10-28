import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'scngx-resource-grid-item',
  templateUrl: './resource-grid-item.component.html',
  styleUrls: ['./resource-grid-item.component.scss']
})
export class SCNGXResourceGridItemComponent implements OnInit {

  @Input() public type: "default" | "profile" | "artist" = "default";
  @Input() public item: any;

  constructor() { }

  ngOnInit(): void {
  }

}
