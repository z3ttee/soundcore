import { Component, Input, OnInit, Output } from '@angular/core';
import { Song } from 'src/app/model/song.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'asc-showcase-item',
  templateUrl: './showcase-item.component.html',
  styleUrls: ['./showcase-item.component.scss']
})
export class ShowcaseItemComponent implements OnInit {
  
  @Input() public itemId: string;
  @Input() public artworkId: string;
  @Input() public title: string;
  @Input() public subtitle: string;

  public coverSrc: string = null;

  public async ngOnInit() {
    if(this.artworkId) {
      this.coverSrc = `${environment.api_base_uri}/v1/artworks/${this.artworkId}`;
    } else {
      this.coverSrc = "/assets/img/missing_cover.png"
    }
  }

}
