import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Component, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { combineLatest, filter, fromEvent, map, Observable, Subscription, take } from 'rxjs';
import { StreamService } from 'src/app/features/stream/services/stream.service';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import { environment } from 'src/environments/environment';
import { Song } from '../../../features/song/entities/song.entity';

@Component({
  selector: 'asc-song-item',
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
        private streamService: StreamService,
        public overlay: Overlay,
        public viewContainerRef: ViewContainerRef,
        private contextMenuService: ContextMenuService
    ) {
        combineLatest([
            this.streamService.$currentSong,
            this.streamService.$player
        ]).pipe(map(([song, status]) => ({ song, status }))).subscribe((state) => {
            this.isActive = state.song && state.song?.id == this.song?.id && !state.status.paused;
            this.isPlaying = state.song && state.song?.id == this.song?.id;
            this.isPlayerPaused = state.status.paused
        })
    }

    public async ngOnInit() {
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
            if(this.streamService.isPaused()) {
                this.streamService.play();
            } else {
                this.streamService.pause();
            }
        } else {
            this.streamService.playSong(this.song);
        }
        
    }

    public async openSongMenu(event: MouseEvent, song: Song) {
        this.contextMenuService.open(event, this.songMenu, this.viewContainerRef, {
            $implicit: song
        });
    }

}
