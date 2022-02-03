import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { Observable, of, take, zip } from 'rxjs';
import { Song } from 'src/app/features/song/entities/song.entity';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { LikeService } from 'src/app/services/like.service';
import audio_wave_anim from "src/assets/animated/audio_wave.json"

@Component({
  selector: 'asc-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss']
})
export class SongListComponent implements OnInit {

    // Make dataSource to observable
    @Input() public dataSource: Observable<Song[]> = of([]);

    @Input() public showHead: boolean = true;
    @Input() public showAlbum: boolean = true;
    @Input() public showCover: boolean = true;
    @Input() public showDate: boolean = true;
    @Input() public showCount: boolean = true;
    @Input() public showMore: boolean = true;

    @Output() public onMore: EventEmitter<void> = new EventEmitter();
    @Output() public onPlay: EventEmitter<Song> = new EventEmitter();

    public displayedColumns: string[] = [];

    public animOptions: AnimationOptions = {
        autoplay: true,
        loop: true,
        animationData: audio_wave_anim
    }

    constructor(
        public audioService: AudioService,
        private likeService: LikeService
    ) {}

    public ngOnInit(): void {
        this.displayedColumns.push("nr");
        this.displayedColumns.push("title");
        if(this.showCount) this.displayedColumns.push("streamCount")
        if(this.showAlbum) this.displayedColumns.push("album")
        if(this.showDate) this.displayedColumns.push("date")

        this.displayedColumns.push("liked");
        this.displayedColumns.push("duration");
    }

    public async playOrPause(song: Song) {
        this.onPlay.emit(song);
        /*zip([
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
        })*/
    }

    public async likeSong(song: Song) {
        this.likeService.likeSong(song?.id).then(() => {
            song.isLiked = !song.isLiked;
        });
    }

    public trackBySongId(index: number, element: Song): string {
        return element.id
    }

}
