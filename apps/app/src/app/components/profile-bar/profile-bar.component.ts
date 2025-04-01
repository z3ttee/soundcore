import { Component, Input, OnInit } from '@angular/core';
import { SCCDKScreenService } from '@repo/angular-cdk';
import { SSOService, SSOUser } from '@soundcore/sso';

@Component({
  selector: 'app-profile-bar',
  templateUrl: './profile-bar.component.html',
  styleUrls: ['./profile-bar.component.scss']
})
export class ProfileBarComponent implements OnInit {

  @Input() public user: SSOUser;

  public showOverlay: boolean = false;

  constructor(
    public readonly authService: SSOService,
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
