import { Component, Input, OnInit } from '@angular/core';
import { User, MeiliUser } from '@soundcore/sdk';

@Component({
  selector: 'scngx-profile-grid-item',
  templateUrl: './profile-grid-item.component.html',
  styleUrls: ['./profile-grid-item.component.scss']
})
export class SCDKProfileGridItemComponent implements OnInit {

  @Input() public item: User | MeiliUser;

  constructor() { }

  ngOnInit(): void {}

}
