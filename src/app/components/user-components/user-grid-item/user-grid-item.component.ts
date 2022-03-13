import { Component, Input, OnInit } from '@angular/core';
import { StreamService } from 'src/app/features/stream/services/stream.service';
import { User } from 'src/app/features/user/entities/user.entity';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'asc-user-grid-item',
  templateUrl: './user-grid-item.component.html',
  styleUrls: ['./user-grid-item.component.scss']
})
export class UserGridItemComponent implements OnInit {

  @Input() public user: User;

  public coverSrc: string = null;
  // TODO: public accentColor: string = "";

  constructor(private streamService: StreamService) {
  }

  public async ngOnInit() {
    // if(this.user.avatarResourceId) {
    //   this.coverSrc = `${environment.sso_base_uri}/media/avatars/${this.user.avatarResourceId}`;
      // this.accentColor = this.artist.artwork.accentColor || "#000000";
    // } else {
      this.coverSrc = "/assets/img/missing_cover.png"
    // }
  }

}
