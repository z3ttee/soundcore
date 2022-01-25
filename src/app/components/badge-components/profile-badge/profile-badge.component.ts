import { Component, Input } from '@angular/core';
import { User } from 'src/app/features/user/entities/user.entity';

@Component({
  selector: 'asc-profile-badge',
  templateUrl: './profile-badge.component.html',
  styleUrls: ['./profile-badge.component.scss']
})
export class ProfileBadgeComponent {

  @Input() public user: User;

}
