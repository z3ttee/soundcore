import { Location } from "@angular/common";
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, ViewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { SCCDKScreenService } from "@soundcore/cdk";
import { Album, Artist, Playlist, SCSDKLikeService, Song, TracklistType } from "@soundcore/sdk";
import { combineLatest, filter, map, Observable, Subject, takeUntil } from "rxjs";
import { AppAudioService } from "src/app/modules/player/services/audio.service";
import { AppControlsService } from "src/app/modules/player/services/controls.service";
import { AppPlayerService } from "src/app/modules/player/services/player.service";

interface BigPictureProps {
    song?: Song;
    album?: Album;
    playlist?: Playlist;
    artist?: Artist;

    currentTime?: number;
    playing?: boolean;
    volume?: number;
    isMuted?: boolean;

    isMobile?: boolean;
}

@Component({
    selector: "app-big-picture",
    templateUrl: "./bigpicture.component.html",
    styleUrls: [ "./bigpicture.component.scss" ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BigPictureComponent implements OnDestroy, AfterViewInit {

    @ViewChild("container") public containerRef: ElementRef<HTMLElement>;

    constructor(
        public readonly player: AppPlayerService,
        public readonly controls: AppControlsService,
        public readonly audio: AppAudioService,
        private readonly screen: SCCDKScreenService,
        private readonly likeService: SCSDKLikeService,
        private readonly snackbar: MatSnackBar,
        private readonly location: Location,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute
    ) {}

    private readonly $destroy: Subject<void> = new Subject();

    public readonly $props: Observable<BigPictureProps> = combineLatest([
        this.player.$current,
        this.player.$currentTime,
        this.screen.$isTouch,
        this.audio.$muted,
        this.audio.$volume,
        this.controls.$isPaused,
    ]).pipe(
        map(([playerItem, currentTime, isTouch, isMuted, volume, isPaused]): BigPictureProps => ({
            song: playerItem?.song,
            playlist: playerItem?.tracklist?.contextType === TracklistType.PLAYLIST ? playerItem?.tracklist?.context : undefined,
            artist: playerItem?.tracklist?.contextType === TracklistType.ARTIST || playerItem?.tracklist?.contextType === TracklistType.ARTIST_TOP ? playerItem?.tracklist?.context : undefined,
            album: playerItem?.tracklist?.contextType === TracklistType.ALBUM ? playerItem?.tracklist?.context : undefined,
            currentTime: currentTime,
            isMobile: isTouch,
            isMuted: isMuted,
            volume: volume,
            playing: !isPaused
        })),
        takeUntil(this.$destroy)
    );

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

    public ngAfterViewInit(): void {
        const element = this.containerRef.nativeElement;
        element.requestFullscreen && element.requestFullscreen();
    }

    public onSeek(value: number) {
        this.controls.seek(value);
    }

    public toggleMute() {
        this.audio.toggleMute();
    }

    public setVolume(volume: number) {
        this.audio.setVolume(volume);
    }

    public closeBigPicture() {
        const path = this.location.path();

        if(path.startsWith('/bigpicture')) {
            this.router.navigate(['/'], { skipLocationChange: false })
            return;
        }

        this.router.navigate([this.location.path()], { skipLocationChange: true })
    }

    public toggleLike(event: MouseEvent, song: Song) {
        event.stopPropagation();
        event.preventDefault();

        if(typeof song === "undefined" || song == null) return;
        this.likeService.toggleLikeForSong(song).pipe(takeUntil(this.$destroy), filter((request) => !request.loading)).subscribe((request) => {
            if(request.error) {
                this.snackbar.open(`Ein Fehler ist aufgetreten`, null, { duration: 3000 });
                return;
            }

            const isLiked = request.data.isLiked;
            song.liked = isLiked ?? song.liked;

            if(isLiked) {
                this.snackbar.open(`Song zu Lieblingssongs hinzugefügt`, null, { duration: 3000 });
            } else {
                this.snackbar.open(`Song aus Lieblingssongs entfernt`, null, { duration: 3000 });
            }
        });
    }

    @HostListener("fullscreenchange", ['$event'])
    @HostListener('webkitfullscreenchange', ['$event'])
    @HostListener('mozfullscreenchange', ['$event'])
    public onFullscreenChange(event: Event) {
        const fullscreenElement = document.fullscreenElement;
        if(typeof fullscreenElement === "undefined" || fullscreenElement == null) {
            this.closeBigPicture();
        } else {
            console.log(event)
        }
    }

}