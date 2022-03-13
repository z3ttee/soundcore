import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/features/user/entities/user.entity';
import { AuthenticationService } from 'src/sso/services/authentication.service';

@Component({
  selector: 'asc-profile-dropdown',
  templateUrl: './profile-dropdown.component.html',
  styleUrls: ['./profile-dropdown.component.scss']
})
export class AscProfileDropdownComponent implements OnInit {

  @Input() public user: User;

  constructor(
    private authService: AuthenticationService
  ) { }

  public ngOnInit(): void {}

  public async logout() {
    this.authService.logout();
  }

}
