import { Component, Input, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { Artist } from 'src/app/features/artist/entities/artist.entity';

@Component({
  selector: 'asc-artist-grid-item',
  templateUrl: './artist-grid-item.component.html',
  styleUrls: ['./artist-grid-item.component.scss']
})
export class ArtistGridItemComponent implements OnInit {

  @Input() public artist: Artist;
  @Input() public playable: boolean = true;

  public $isPlaying: Observable<boolean>;

  constructor(private audioService: AudioService) {
    this.$isPlaying = this.audioService.$currentItem.pipe(map((item) => !!item?.song?.artists.find((artist) => artist.id == this.artist.id)));
  }

  public async ngOnInit() {
    
  }

  public async playOrPause() {
    if(!this.playable) return;
    // TODO: this.audioService.playArtist(this.artist);
  }

}
