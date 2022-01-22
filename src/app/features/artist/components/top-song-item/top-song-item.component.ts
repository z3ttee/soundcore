import { Component, Input, OnInit } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { Song } from 'src/app/features/song/entities/song.entity';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { Artist } from 'src/app/model/artist.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'asc-top-song-item',
  templateUrl: './top-song-item.component.html',
  styleUrls: ['./top-song-item.component.scss']
})
export class TopSongItemComponent implements OnInit {

    @Input() public song: Song;
    @Input() public excludeArtistIds: string[]

    public playable: boolean = true;

    public coverSrc: string = null;
    public accentColor: string = "";

    public isPlaying: boolean = false;
    public isActive: boolean = false;
    public isPlayerPaused: boolean = true;

    public artists: Artist[] = [];
    
    constructor(
        private audioService: AudioService,
    ) {
        combineLatest([
            this.audioService.$currentSong,
            this.audioService.$paused
        ]).pipe(map(([song, paused]) => ({ song, paused }))).subscribe((state) => {
            this.isActive = state.song && state.song?.id == this.song?.id && !state.paused;
            this.isPlaying = state.song && state.song?.id == this.song?.id;
            this.isPlayerPaused = state.paused
        })
    }

    public async ngOnInit() {
        this.artists = this.song.artists?.filter((artist) => !this.excludeArtistIds?.includes(artist.id)) || [];

        if(this.song.artwork) {
            this.coverSrc = `${environment.api_base_uri}/v1/artworks/${this.song.artwork.id}`;
            this.accentColor = this.song.artwork.accentColor || "#000000";
        } else {
            this.coverSrc = "/assets/img/missing_cover.png"
        }
    }

    public async playOrPause() {
        if(!this.playable) return;

        if(this.isPlaying) {
            if(this.isPlayerPaused) {
                this.audioService.play();
            } else {
                this.audioService.pause();
            }
        } else {
            this.audioService.play(this.song);
        }
    }

}
