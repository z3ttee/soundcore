import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Artwork, SCDKArtworkService } from 'soundcore-sdk';

@Component({
  selector: 'scngx-artwork',
  templateUrl: './artwork.component.html',
  styleUrls: ['./artwork.component.scss']
})
export class SCNGXArtworkComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() public artwork: Artwork;
  public src: string;

  constructor(private readonly artworkService: SCDKArtworkService) { }

  public ngOnInit(): void {
    this.init(this.artwork);
  }
  public ngAfterViewInit(): void {
    
  }
  public ngOnChanges(changes: SimpleChanges): void {
    this.init(changes["artwork"].currentValue);
  }

  public onError() {
    console.log("error on img")
  }

  public onLoad() {
    console.log("load on img")
  }

  private init(artwork: Artwork) {
    // console.log(artwork)
    firstValueFrom(this.artworkService.buildArtworkURL(artwork)).then((url: string) => {
      this.src = url;
      console.log(url);
    })
  }

}
