import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'scngx-bullet-list',
  templateUrl: './bullet-list.component.html',
  styleUrls: ['./bullet-list.component.scss']
})
export class SCNGXBulletListComponent implements OnInit {

  @Input() public lines: number = 1;
  @Input() public items: string[];

  constructor() { }

  public ngOnInit(): void {}

}
