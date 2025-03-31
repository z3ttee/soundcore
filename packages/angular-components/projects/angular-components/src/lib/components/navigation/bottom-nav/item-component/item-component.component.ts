import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'scngx-nav-item',
  templateUrl: './item-component.component.html',
  styleUrls: ['./item-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXNavItemComponent implements OnInit {

  @Input() public label: string;
  @Input() public active: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
