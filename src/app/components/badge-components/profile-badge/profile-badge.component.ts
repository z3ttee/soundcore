import { Component, Input } from '@angular/core';
import { User as UserV2 } from 'soundcore-sdk';
import { User as UserV1 } from 'src/app/features/user/entities/user.entity';

type User = UserV1 | UserV2

@Component({
  selector: 'asc-profile-badge',
  templateUrl: './profile-badge.component.html',
  styleUrls: ['./profile-badge.component.scss']
})
export class ProfileBadgeComponent {

  @Input() public user: User;
  @Input() public align: "rtl" | "ltr" = "ltr";

}
