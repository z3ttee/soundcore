import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/features/user/entities/user.entity';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'asc-profile-badge',
  templateUrl: './profile-badge.component.html',
  styleUrls: ['./profile-badge.component.scss']
})
export class ProfileBadgeComponent implements OnInit {

  private _user: User = null;

  public avatarUrl: string;

  @Input() public set user(val: User) {
    this._user = val;

    if(val?.avatarResourceId) {
      this.avatarUrl = `${environment.sso_base_uri}/media/avatars/${val?.avatarResourceId}`
    } else {
      this.avatarUrl = null;
    }
  }

  public get user(): User {
    return this._user;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
