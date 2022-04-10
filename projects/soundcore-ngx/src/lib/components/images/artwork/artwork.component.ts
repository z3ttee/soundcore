import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Artwork, SCDKArtworkService } from 'soundcore-sdk';

@Component({
  selector: 'scngx-artwork',
  templateUrl: './artwork.component.html',
  styleUrls: ['./artwork.component.scss']
})
export class SCNGXArtworkComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() public artwork: Artwork;

  @ViewChild("image") public imageRef: ElementRef<HTMLImageElement>;

  public src: string;
  public isLoading: boolean = false;
  public canShow: boolean = false;

  constructor(
    private readonly artworkService: SCDKArtworkService
  ) { }

  public ngOnInit(): void {
    this.init(this.artwork);
  }
  public ngAfterViewInit(): void {
    
  }
  public ngOnChanges(changes: SimpleChanges): void {
    this.init(changes["artwork"].currentValue);
  }

  public onError() {
    this.isLoading = false;
    this.canShow = false;
    this.src = "assets/img/missing_cover.png";
  }

  public onLoad() {
    this.isLoading = false;
    this.canShow = true;
  }

  public onLoadStart() {
    this.isLoading = true;
    this.canShow = false;
  }

  private init(artwork: Artwork) {
    // console.log(artwork)
    firstValueFrom(this.artworkService.buildArtworkURL(artwork)).then((url: string) => {
      this.src = url;
      console.log(url);
    })
  }

}
