import { Overlay } from '@angular/cdk/overlay';
import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AnimationOptions } from 'ngx-lottie';
import { combineLatest, map, Subject, takeUntil } from 'rxjs';
import { ChoosePlaylistComponent } from 'src/app/features/playlist/dialogs/choose-playlist/choose-playlist.component';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { PlaylistService } from 'src/app/features/playlist/services/playlist.service';
import { Song } from 'src/app/features/song/entities/song.entity';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import audio_wave_anim from "src/assets/animated/audio_wave.json"

@Component({
  selector: 'asc-song-list-item',
  templateUrl: './song-list-item.component.html',
  styleUrls: ['./song-list-item.component.scss']
})
export class SongListItemComponent implements OnInit, OnDestroy {

    @ViewChild('songMenu') songMenu: TemplateRef<any>;

    @Input() public song: Song;
    @Input() public showAlbum: boolean = true;
    @Input() public showCover: boolean = true;
    @Input() public titleNr: number = undefined;

    public animOptions: AnimationOptions = {
        autoplay: true,
        loop: true,
        animationData: audio_wave_anim
    }

    public playable: boolean = true;

    public coverSrc: string = null;
    public accentColor: string = "";    

    // IsActive: 
    public isActive: boolean = false;
    public isPlayerPaused: boolean = true;
    public isPlaying: boolean = false;

    public _unsubscribeNotify: Subject<void> = new Subject();
    
    constructor(
        private audioService: AudioService,
        public overlay: Overlay,
        public viewContainerRef: ViewContainerRef,
        private contextMenuService: ContextMenuService,
        private dialog: MatDialog,
        private playlistService: PlaylistService
    ) {}

    public async ngOnInit() {
        combineLatest([
            this.audioService.$currentSong,
            this.audioService.$paused
        ]).pipe(
            takeUntil(this._unsubscribeNotify),
            map(([song, paused]) => ({ song, paused }))
        ).subscribe((state) => {
            this.isActive = state.song && state.song?.id == this.song?.id;
            this.isPlaying = this.isActive && !state.paused;
            this.isPlayerPaused = state.paused
        })
    }

    public ngOnDestroy() {
        this._unsubscribeNotify.next();
        this._unsubscribeNotify.complete();
    }

    public async playOrPause() {
        if(!this.playable) return;

        this.contextMenuService.close();

        if(this.isActive) {
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
            this.playlistService.updateSongs(playlist.id, {
                action: "add",
                songs: [ this.song ]
            })
        })
    }

}
