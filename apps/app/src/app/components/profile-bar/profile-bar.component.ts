import { Component, Input, OnInit } from '@angular/core';
import { SCCDKScreenService } from '@repo/angular-cdk';
import { AuthenticationService, Profile } from '@repo/angular-oidc';

@Component({
  selector: 'app-profile-bar',
  templateUrl: './profile-bar.component.html',
  styleUrls: ['./profile-bar.component.scss'],
  standalone: false
})
export class ProfileBarComponent implements OnInit {

  @Input() public user: Profile;

  public showOverlay: boolean = false;

  constructor(
    public readonly authService: AuthenticationService,
    public readonly screenService: SCCDKScreenService
  ) { }

  public ngOnInit(): void { }

  public onMouseEnter(event: MouseEvent) {
    this.showOverlay = true;
  }

  public onMouseLeave(event: MouseEvent) {
    this.showOverlay = false;
  }

}
