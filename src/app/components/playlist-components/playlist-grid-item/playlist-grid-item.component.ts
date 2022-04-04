import { Component, Input, OnInit } from '@angular/core';
import { Playlist } from 'soundcore-sdk';
import { AudioService } from 'src/app/features/stream/services/audio.service';

@Component({
  selector: 'asc-playlist-grid-item',
  templateUrl: './playlist-grid-item.component.html',
  styleUrls: ['./playlist-grid-item.component.scss']
})
export class PlaylistGridItemComponent implements OnInit {

  @Input() public playlist: Playlist;
  @Input() public playable: boolean = true;

  public coverSrc: string = null;
  public accentColor: string = "";

  constructor(private audioService: AudioService) {}

  public async ngOnInit() {
    
  }

  public async playOrPause() {
    if(!this.playable) return;
    // TODO: this.audioService.playAlbum(this.album);
  }

}
