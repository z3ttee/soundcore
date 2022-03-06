import { Overlay } from '@angular/cdk/overlay';
import { Component, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import { environment } from 'src/environments/environment';
import { Song } from '../../../features/song/entities/song.entity';

@Component({
  selector: 'asc-song-grid-item',
  templateUrl: './song-grid-item.component.html',
  styleUrls: ['./song-grid-item.component.scss']
})
export class SongGridItemComponent implements OnInit {

    @ViewChild('songMenu') songMenu: TemplateRef<any>;

    @Input() public song: Song;
    @Input() public playable: boolean = true;

    public coverSrc: string = null;
    public accentColor: string = "";

    public isPlaying: boolean = false;
    public isActive: boolean = false;
    public isPlayerPaused: boolean = true;
    
    constructor(
        private audioService: AudioService,
        public overlay: Overlay,
        public viewContainerRef: ViewContainerRef,
        private contextMenuService: ContextMenuService
    ) {
        /*combineLatest([
            this.audioService.$currentSong,
            this.audioService.$paused
        ]).pipe(map(([song, paused]) => ({ song, paused }))).subscribe((state) => {
            this.isActive = state.song && state.song?.id == this.song?.id && !state.paused;
            this.isPlaying = state.song && state.song?.id == this.song?.id;
            this.isPlayerPaused = state.paused
        })*/
    }

    public async ngOnInit() {
        if(this.song.artwork) {
            this.coverSrc = `${environment.api_base_uri}/v1/artworks/${this.song.artwork.id}`;
            this.accentColor = this.song.artwork.accentColor || "#000000";
        } else {
            this.coverSrc = "/assets/img/missing_cover.png"
        }
    }

    public async playOrPause(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        
        if(!this.playable) return;

        this.contextMenuService.close();
        this.audioService.playOrPause(this.song);
    }

    public async enqueue() {
        this.audioService.enqueueSong(this.song)
        this.contextMenuService.close();
    }

}
