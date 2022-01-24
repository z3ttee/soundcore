import { Component, Input, OnInit } from '@angular/core';
import { Album } from 'src/app/features/album/entities/album.entity';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { Song } from 'src/app/features/song/entities/song.entity';
import { User } from 'src/app/features/user/entities/user.entity';
import { Artist } from 'src/app/model/artist.model';
import { environment } from 'src/environments/environment';
import { SearchBestMatch } from '../../entities/best-match.entity';

@Component({
  selector: 'asc-best-match',
  templateUrl: './best-match.component.html',
  styleUrls: ['./best-match.component.scss']
})
export class BestMatchComponent implements OnInit {

  private _item: SearchBestMatch = null;

  @Input() public set item(val: SearchBestMatch) {
    this._item = val;
    console.log(val)
    this.init();
  };

  public get item(): SearchBestMatch {
    return this._item;
  }

  public coverSrc: string = null;
  public accentColor: string = "";

  public isExplicit: boolean = false;
  public artists: Artist[];

  public title: string;

  constructor() { }

  public ngOnInit(): void {
      
  }

  public init() {
    this.reset();
    if(!this._item) return;

    if(this.item.match["artwork"]) {
      this.coverSrc = `${environment.api_base_uri}/v1/artworks/${this.item.match["artwork"].id}`;
      this.accentColor = this.item.match["artwork"].accentColor || "#000000";
    } else {
      this.coverSrc = "/assets/img/missing_cover.png"
    }

    if(this.item.type == "song" || this.item.type == "album" ||this.item.type == "playlist") {
      this.title = (this.item.match as Playlist | Song | Album).title
    } else {
      this.title = this.item.match["name"];
    }

    if(this.item.type == "song" || this.item.type == "album") {
      this.artists = (this.item.match as Song | Album).artists
    }

    if(this.item.type == "song") {
      this.isExplicit = (this.item.match as Song).explicit
    }

    if(this.item.type == "user") {
      const user = (this.item.match as User);
      this.title = user.username

      if(user.avatarResourceId) {
        this.coverSrc = `${environment.sso_base_uri}/media/avatars/${(this.item.match as User).avatarResourceId}`;
      } else {
        this.coverSrc = "/assets/img/missing_cover.png"
      }
    }
  }

  public reset() {
    this.title = undefined;
    this.accentColor = "";
    this.artists = undefined;
    this.coverSrc = undefined;
    this.isExplicit = false;
  }

}
