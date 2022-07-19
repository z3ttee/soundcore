import { Component, Input, OnInit } from '@angular/core';
import { SCCDKScreenService } from 'soundcore-cdk';
import { User } from 'soundcore-sdk';
import { AuthenticationService } from 'src/sso/services/authentication.service';

@Component({
  selector: 'app-profile-bar',
  templateUrl: './profile-bar.component.html',
  styleUrls: ['./profile-bar.component.scss']
})
export class ProfileBarComponent implements OnInit {

  @Input() public user: User;

  public showOverlay: boolean = false;

  constructor(
    public readonly authService: AuthenticationService,
    public readonly screenService: SCCDKScreenService
  ) { }

  public ngOnInit(): void {}

  public onMouseEnter(event: MouseEvent) {
    this.showOverlay = true;
  }

  public onMouseLeave(event: MouseEvent) {
    this.showOverlay = false;
  }

}
