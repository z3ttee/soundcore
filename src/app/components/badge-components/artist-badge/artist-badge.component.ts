import { Component, Input } from '@angular/core';
import { Artist } from 'src/app/model/artist.model';
import { Distributor } from 'src/app/model/distributor.entity';
import { Label } from 'src/app/model/label.model';
import { Publisher } from 'src/app/model/publisher.model';

@Component({
  selector: 'asc-artist-badge',
  templateUrl: './artist-badge.component.html',
  styleUrls: ['./artist-badge.component.scss']
})
export class ArtistBadgeComponent {

  @Input() public artist: Artist | Distributor | Label | Publisher;

}
