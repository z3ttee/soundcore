import { Component, Input, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { take, zip } from 'rxjs';
import { Song } from 'src/app/features/song/entities/song.entity';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import audio_wave_anim from "src/assets/animated/audio_wave.json"

@Component({
  selector: 'asc-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss']
})
export class SongListComponent implements OnInit {

    @Input() public dataSource: Song[] = [];

    @Input() public showHead: boolean = true;
    @Input() public showAlbum: boolean = true;
    @Input() public showCover: boolean = true;
    @Input() public showDate: boolean = true;
    @Input() public showCount: boolean = true;

    public animOptions: AnimationOptions = {
        autoplay: true,
        loop: true,
        animationData: audio_wave_anim
    }

    constructor(public audioService: AudioService) { }

    ngOnInit(): void {
    }

    public async playOrPause(song: Song) {
        zip([
            this.audioService.$currentSong,
            this.audioService.$paused
        ]).pipe(take(1)).subscribe((state) => {
            const isActive = state[0]?.id == song.id;
            const isPlayerPaused = state[1];

            if(!isActive) {
                this.audioService.play(song)
                return;
            }

            if(!isPlayerPaused) {
                this.audioService.pause();
                return
            } else {
                this.audioService.play();
            }
        })

        /*if(!this.playable) return;

        this.contextMenuService.close();

        if(this.isActive) {
            if(this.isPlayerPaused) {
                this.audioService.play();
            } else {
                this.audioService.pause();
            }
        } else {
            this.audioService.play(this.song);
        }*/
        
    }

}
