import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'scngx-collection-grid-item',
  templateUrl: './collection-grid-item.component.html',
  styleUrls: ['./collection-grid-item.component.scss']
})
export class SCNGXCollectionGridItemComponent implements OnInit {

  @Input() public type: "default" | "profile" | "artist" = "default";
  @Input() public item: any;

  constructor() { }

  ngOnInit(): void {
  }

}
