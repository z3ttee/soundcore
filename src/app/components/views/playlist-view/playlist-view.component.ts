import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PlaylistPrivacy } from 'src/app/features/playlist/types/playlist-privacy.types';
import { Artwork } from 'src/app/model/artwork.model';

export type PlaylistViewType = "playlist" | "song" | "artist" | "collection" | "album" | "user";
export interface PlaylistViewOptions {
  type?: PlaylistViewType;
  privacy?: PlaylistPrivacy;
  title?: string;
  artwork?: Artwork;
  color?: string;
}

@Component({
  selector: 'asc-playlist-view',
  templateUrl: './playlist-view.component.html',
  styleUrls: ['./playlist-view.component.scss']
})
export class PlaylistViewComponent implements OnInit, OnDestroy {

  // Default colors  
  public accentColor: string = "#FFBF50";
  public colorWhite: string = "#DDDDDD";

  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  @Input() public mode: "default" | "titleOnly" | "reduced" = "default"
  @Input() public playable: boolean = true;
  @Input() public likeable: boolean = true;
  @Input() public isLiked: boolean = false;
  @Input() public followable: boolean = false;
  @Input() public isPaused: boolean = true;

  @Input() public artwork: Artwork;

  @Input() public options: PlaylistViewOptions = {
    type: "playlist",
    privacy: "public",
    title: "Unknown title",

    // TODO: Remove artwork from options object
    artwork: undefined,
    color: this.colorWhite
  };

  @Output() public onPlay: EventEmitter<void> = new EventEmitter();
  @Output() public onLike: EventEmitter<void> = new EventEmitter();
  @Output() public onFollow: EventEmitter<void> = new EventEmitter();

  constructor() { }

  public ngOnInit(): void {
    if(this.mode == "titleOnly") this.accentColor = this.colorWhite
  }
  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

}
