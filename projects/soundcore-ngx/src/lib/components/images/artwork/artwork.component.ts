import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Artwork, SCDKArtworkService } from 'soundcore-sdk';

@Component({
  selector: 'scngx-artwork',
  templateUrl: './artwork.component.html',
  styleUrls: ['./artwork.component.scss']
})
export class SCNGXArtworkComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() public artwork: Artwork;

  @ViewChild("image") public imageRef: ElementRef<HTMLImageElement>;

  private _srcSubject: BehaviorSubject<string> = new BehaviorSubject("");
  public $src: Observable<string> = this._srcSubject.asObservable();
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
    this._srcSubject.next("assets/img/missing_cover.png");
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
    firstValueFrom(this.artworkService.buildArtworkURL(artwork)).then((url: string) => {
      this._srcSubject.next(url);
    })
  }

}
