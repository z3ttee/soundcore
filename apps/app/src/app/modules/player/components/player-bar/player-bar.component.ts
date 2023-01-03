import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { SCCDKScreenService } from "@soundcore/cdk";
import { SCSDKLikeService, Song } from "@soundcore/sdk";
import { combineLatest, filter, map, Observable, Subject, take, takeUntil, tap } from "rxjs";
import { AppControlsService } from "../../services/controls.service";
import { AppPlayerService } from "../../services/player.service";

interface PlayerbarProps {
    song?: Song;
    currentTime?: number;
    playing?: boolean;
    isMobile?: boolean;
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppPlayerBarComponent implements OnInit, OnDestroy {

    public readonly seekInputControl: FormControl<number> = new FormControl(0);

    /**
     * Subject to notify subscriptions about destroying themselves.
     */
    private readonly _destroy: Subject<void> = new Subject();

    constructor(
        public readonly player: AppPlayerService,
        public readonly controls: AppControlsService,
        private readonly likeService: SCSDKLikeService,
        private readonly snackbar: MatSnackBar,
        private readonly screen: SCCDKScreenService,
        private readonly router: Router
    ) {}

    public $props: Observable<PlayerbarProps> = combineLatest([
        this.player.$current.pipe(takeUntil(this._destroy)),
        this.player.$currentTime.pipe(takeUntil(this._destroy)),
        this.controls.$isPaused.pipe(takeUntil(this._destroy)),
        this.screen.$screen.pipe(takeUntil(this._destroy))
    ]).pipe(
        map(([currentItem, currentTime, isPaused, screen]): PlayerbarProps => ({
            song: currentItem?.song,
            currentTime: currentTime ?? 0,
            playing: !isPaused,
            isMobile: screen.isMobile
        })),
        tap((props) => {
            this.seekInputControl.setValue(props.currentTime);
        })
    );

    public ngOnInit(): void {
        this.likeService.$onSongLikeChanged.pipe(takeUntil(this._destroy)).subscribe((toggleResult) => {
            const likedSong = toggleResult.song;
            const isLiked = toggleResult.isLiked;

            this.$props.pipe(filter((props) => !!props.song && props.song?.id == likedSong?.song?.id), take(1), takeUntil(this._destroy)).subscribe(({ song }) => {
                song.liked = isLiked ?? song.liked;
            });
        });
    }

    public ngOnDestroy(): void {
        // Notify subscriptions to destroy themselves
        this._destroy.next();
        this._destroy.complete();
    }

    public onSeek(value: number) {
        this.controls.seek(value);
    }

    public toggleLike(song: Song) {
        if(typeof song === "undefined" || song == null) return;
        this.likeService.toggleLikeForSong(song).pipe(takeUntil(this._destroy), filter((request) => !request.loading)).subscribe((request) => {
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
        console.log("TODO: Bigpicture")
    }

    public openBigPictureMobile() {
        this.router.navigate(['/bigpicture'], {
            skipLocationChange: true
        });
    }
}