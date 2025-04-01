import { Component, Input, OnInit } from '@angular/core';
import { MeiliUser, User } from '@repo/angular-sdk';

@Component({
    selector: 'scngx-profile-grid-item',
    templateUrl: './profile-grid-item.component.html',
    styleUrls: ['./profile-grid-item.component.scss'],
    standalone: false
})
export class SCDKProfileGridItemComponent implements OnInit {

  @Input() public item: User | MeiliUser;

  constructor() { }

  ngOnInit(): void { }

}
