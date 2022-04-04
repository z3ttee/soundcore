import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Artwork as ArtworkV1 } from 'src/app/model/artwork.model';
import { environment } from 'src/environments/environment';
import { Artwork as ArtworkV2 } from 'soundcore-sdk';

type Artwork = ArtworkV1 | ArtworkV2

@Component({
  selector: 'asc-artwork',
  templateUrl: './artwork.component.html',
  styleUrls: ['./artwork.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ArtworkComponent implements OnInit, OnChanges {

  @Input() public artwork: Artwork;
  @Input() public showAccent: boolean = true;
  @Input() public type: "artist" | "default"

  public artworkUrl: string;
  public accentColor: string;

  constructor() { }

  public ngOnInit(): void {
    this.initUrl(this.artwork);
  }

  public ngOnChanges(changes: SimpleChanges): void {
      this.initUrl(changes["artwork"].currentValue);
  }

  public initUrl(artwork: Artwork): void {
    if(artwork?.id) {
      this.artworkUrl = `${environment.api_base_uri}/v1/artworks/${artwork.id}`;
      this.accentColor = artwork.accentColor
    } else {
      this.onError();
    }
  }

  public onError() {
    this.artworkUrl = "/assets/img/missing_cover.png";
    this.accentColor = "#000000";
  }

}
