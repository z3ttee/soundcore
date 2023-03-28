import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { SCCDKScreenService } from "@soundcore/cdk";
import { SCSDKLikeService, Song } from "@soundcore/sdk";
import { combineLatest, filter, map, Observable, Subject, take, takeUntil, tap } from "rxjs";
import { PlayerService } from "../../services/player.service";

interface PlayerbarProps {
    song?: Song;
    isPaused?: boolean;
    isShuffled?: boolean;

    currentTime?: number;
    isMobile?: boolean;
    isMuted?: boolean;
    volume?: number;
}

interface ResponsiveOptions {
    showDuration: boolean;
    showMaximize: boolean;
    showHistoryControls: boolean;
    reducedMode: boolean;
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
        private readonly screen: SCCDKScreenService,
        private readonly router: Router,
        private readonly playerService: PlayerService
    ) {}

    public $props: Observable<PlayerbarProps> = combineLatest([
        this.playerService.$currentItem,
        this.playerService.$isPaused,
        this.playerService.$isShuffled
    ]).pipe(
        map(([currentItem, isPaused, isShuffled]): PlayerbarProps => ({
            song: currentItem?.song ?? currentItem as Song,
            isPaused: isPaused,
            isShuffled: isShuffled
        })),
        tap((props) => {
            this.seekInputControl.setValue(props.currentTime);
        }),
        tap((props) => console.log(props)),
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

    public toggleMute() {
        // this.audio.toggleMute();
    }

    public setVolume(volume: number) {
        // this.audio.setVolume(volume);
    }

    public skip() {
        this.playerService.skip().subscribe();
    }

    public togglePlaying() {
        this.playerService.togglePlaying().subscribe();
    }

    public toggleShuffle() {
        this.playerService.toggleShuffle().subscribe((shuffled) => {
            console.log(shuffled);
        });
    }
}