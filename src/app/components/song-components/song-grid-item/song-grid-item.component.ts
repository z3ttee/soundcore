import { Overlay } from '@angular/cdk/overlay';
import { Component, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, map } from 'rxjs';
import { ChoosePlaylistComponent } from 'src/app/features/playlist/dialogs/choose-playlist/choose-playlist.component';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { PlaylistService } from 'src/app/features/playlist/services/playlist.service';
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
        private contextMenuService: ContextMenuService,
        private dialog: MatDialog,
        private playlistService: PlaylistService
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
        if(this.song.artwork) {
            this.coverSrc = `${environment.api_base_uri}/v1/artworks/${this.song.artwork.id}`;
            this.accentColor = this.song.artwork.accentColor || "#000000";
        } else {
            this.coverSrc = "/assets/img/missing_cover.png"
        }
    }

    public async playOrPause() {
        if(!this.playable) return;

        this.contextMenuService.close();

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

    public async openSongMenu(event: MouseEvent, song: Song) {
        this.contextMenuService.open(event, this.songMenu, this.viewContainerRef, {
            $implicit: song
        });
    }

    public async openChoosePlaylist() {
        const ref = this.dialog.open(ChoosePlaylistComponent)

        ref.afterClosed().subscribe((playlist: Playlist) => {
            if(!playlist) return;
            this.playlistService.addSongs(playlist.id, [ this.song.id ])
        })
    }

    public async enqueue() {
        this.audioService.enqueueSong(this.song)
        this.contextMenuService.close();
    }

}
