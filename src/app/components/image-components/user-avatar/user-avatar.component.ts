import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'asc-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent implements OnInit, OnChanges {

  @Input() public resourceId: string;

  public avatarUrl: string;

  constructor() { }

  public ngOnInit(): void {
    this.initUrl(this.resourceId);
  }

  public ngOnChanges(changes: SimpleChanges): void {
      this.initUrl(changes["resourceId"].currentValue);
  }

  public initUrl(resourceId: string): void {
    if(resourceId) {
      // TODO this.avatarUrl = `${environment.sso_base_uri}/media/avatars/${resourceId}`;
      this.onError()
    } else {
      this.onError()
    }
  }

  public onError() {
    this.avatarUrl = "/assets/img/missing_cover.png";
  }

}
