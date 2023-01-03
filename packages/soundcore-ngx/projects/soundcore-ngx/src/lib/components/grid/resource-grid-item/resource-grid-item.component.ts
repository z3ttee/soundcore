import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'scngx-resource-grid-item',
  templateUrl: './resource-grid-item.component.html',
  styleUrls: ['./resource-grid-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXResourceGridItemComponent implements OnInit {

  @Input() public type: "default" | "profile" | "artist" = "default";
  @Input() public item: any;
  @Input() public itemWidth: number = 192;
  @Input() public minItemHeight: number = 224;

  constructor() { }

  ngOnInit(): void {
  }

}
