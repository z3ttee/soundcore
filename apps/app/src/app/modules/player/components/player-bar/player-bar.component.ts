import { Location } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { SCSDKLikeService, Song } from "@soundcore/sdk";
import { combineLatest, filter, map, Observable, Subject, take, takeUntil, tap } from "rxjs";
import { PlayerService } from "../../services/player.service";

interface PlayerbarProps {
    song?: Song;
    isPaused?: boolean;
    isShuffled?: boolean;
    isMuted?: boolean;
    volume?: number;


    currentTime?: number;
    isMobile?: boolean;
}

@Component({
    selector: "scngx-player-bar",
    templateUrl: "./player-bar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppPlayerBarComponent implements OnInit, OnDestroy {

    public readonly seekInputControl: FormControl<number> = new FormControl(0);

    /**
     * Subject to notify subscriptions about destroying themselves.
     */
    private readonly $destroy: Subject<void> = new Subject();

    constructor(
        private readonly likeService: SCSDKLikeService,
        private readonly snackbar: MatSnackBar,
        private readonly router: Router,
        private readonly playerService: PlayerService,
        private readonly location: Location,
    ) {}

    // public $currentTime: Observable<number> = this.playerService.

    public $props: Observable<PlayerbarProps> = combineLatest([
        this.playerService.$currentItem,
        this.playerService.$isPaused,
        this.playerService.$shuffled,
        this.playerService.$volume,
        this.playerService.$isMuted,
    ]).pipe(
        map(([currentItem, isPaused, isShuffled, volume, isMuted]): PlayerbarProps => ({
            song: currentItem,
            isPaused: isPaused,
            isShuffled: isShuffled,
            volume: volume,
            isMuted: isMuted
        })),
        tap((props) => {
            this.seekInputControl.setValue(props.currentTime);
        }),
        takeUntil(this.$destroy)
    );

    public ngOnInit(): void {
        this.likeService.$onSongLikeChanged.pipe(takeUntil(this.$destroy)).subscribe((toggleResult) => {
            const likedSong = toggleResult.song;
            const isLiked = toggleResult.isLiked;

            this.$props.pipe(filter((props) => !!props.song && props.song?.id == likedSong?.song?.id), take(1), takeUntil(this.$destroy)).subscribe(({ song }) => {
                song.liked = isLiked ?? song.liked;
            });
        });
    }

    public ngOnDestroy(): void {
        // Notify subscriptions to destroy themselves
        this.$destroy.next();
        this.$destroy.complete();
    }

    public onSeek(value: number) {
        // this.controls.seek(value);
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

    public openBigPicture() {
        // TODO: Just for testing
        console.log("TODO: Bigpicture")
        this.openBigPictureMobile();
    }

    public openBigPictureMobile() {
        this.router.navigate(['/bigpicture'], {
            skipLocationChange: true
        });
    }

    public toggleQueue() {
        if(this.router.url.startsWith("/player/queue")) {
            this.location.back();
        } else {
            this.router.navigate(['/player/queue']);
        }
    }

    public toggleMute() {
        this.playerService.toggleMute();
    }

    public setVolume(volume: number) {
        this.playerService.setVolume(volume);
    }

    public skip() {
        this.playerService.skip().subscribe();
    }

    public togglePlaying() {
        this.playerService.togglePlaying().subscribe();
    }

    public toggleShuffle() {
        this.playerService.toggleShuffle();
    }
}