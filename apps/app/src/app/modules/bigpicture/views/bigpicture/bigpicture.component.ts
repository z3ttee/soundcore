import { Location } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, ViewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { SCCDKScreenService } from "@soundcore/cdk";
import { PlayableEntity, SCSDKLikeService, Song } from "@soundcore/sdk";
import { combineLatest, filter, map, Observable, Subject, takeUntil } from "rxjs";
import { PlayerService, Streamable } from "src/app/modules/player/services/player.service";

interface BigPictureProps {
    song?: Streamable;
    owner?: PlayableEntity;

    currentTime?: number;
    volume?: number;
    shuffled?: boolean;

    isPlaying?: boolean;
    isMuted?: boolean;
    isMobile?: boolean;
}

@Component({
    selector: "app-big-picture",
    templateUrl: "./bigpicture.component.html",
    styleUrls: [ "./bigpicture.component.scss" ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BigPictureComponent implements OnDestroy {

    @ViewChild("container") public containerRef: ElementRef<HTMLElement>;

    constructor(
        private readonly player: PlayerService,
        private readonly screen: SCCDKScreenService,
        private readonly likeService: SCSDKLikeService,
        private readonly snackbar: MatSnackBar,
        private readonly location: Location,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        private readonly cdr: ChangeDetectorRef
    ) {}

    private readonly $destroy: Subject<void> = new Subject();

    public readonly $props: Observable<BigPictureProps> = combineLatest([
        this.player.$currentItem,
        this.player.$currentTime,
        this.player.$isMuted,
        this.player.$isPaused,
        this.player.$shuffled,
        this.player.$volume,
        this.screen.$isTouch,
    ]).pipe(
        map(([currentItem, currentTime, isMuted, isPaused, shuffled, volume, isTouch]): BigPictureProps => ({
            song: currentItem,
            owner: currentItem.owner,
            currentTime: currentTime,
            isMuted: isMuted,
            isPlaying: !isPaused,
            isMobile: isTouch,
            shuffled: shuffled,
            volume: volume,
        })),
        takeUntil(this.$destroy)
    );

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

    public onSeek(value: number) {
        this.player.seek(value);
    }

    public toggleMute() {
        this.player.toggleMute();
    }

    public toggleShuffle() {
        this.player.toggleShuffle();
    }

    public togglePlaying() {
        this.player.togglePlaying().subscribe();
    }

    public toggleQueue() {
        if(this.router.url.startsWith("/player/queue")) {
            this.location.back();
        } else {
            this.router.navigate(['/player/queue']);
        }
    }

    public setVolume(volume: number) {
        this.player.setVolume(volume);
    }

    public skip() {
        this.player.skip().subscribe();
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

            this.cdr.markForCheck();
            this.cdr.detectChanges();

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