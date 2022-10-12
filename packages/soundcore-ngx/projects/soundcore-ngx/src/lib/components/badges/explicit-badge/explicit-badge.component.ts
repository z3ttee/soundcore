import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'scngx-explicit-badge',
  templateUrl: './explicit-badge.component.html',
  styleUrls: ['./explicit-badge.component.scss']
})
export class SCNGXExplicitBadgeComponent implements OnInit {

  @Input() public extended: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
