import { Component, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SCSDKSongService, Song } from "@soundcore/sdk";
import { combineLatest, map, Observable, Subject, switchMap, takeUntil } from "rxjs";
import { AUDIOWAVE_LOTTIE_OPTIONS } from "src/app/constants";
import { PlayerItem } from "src/app/modules/player/entities/player-item.entity";
import { AppPlayerService } from "src/app/modules/player/services/player.service";

interface SongInfoViewProps {
    loading?: boolean;
    playing?: boolean;

    song?: Song;
    currentItem?: PlayerItem;
}

@Component({
    templateUrl: "./song-info.component.html"
})
export class SongInfoViewComponent implements OnDestroy {

    private readonly _destroy: Subject<void> = new Subject();

    // Lottie animations options
    public animOptions = AUDIOWAVE_LOTTIE_OPTIONS;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly songService: SCSDKSongService,
        private readonly player: AppPlayerService
    ) {}

    public readonly $props: Observable<SongInfoViewProps> = combineLatest([
        this.activatedRoute.paramMap.pipe(
            map((params) => params.get("songId")),
            switchMap((songId) => this.songService.findById(songId).pipe(takeUntil(this._destroy)))
        ),
        this.player.$current.pipe(takeUntil(this._destroy)),
        this.player.$isPaused.pipe(takeUntil(this._destroy))
    ]).pipe(
        map(([request, currentItem, isPaused]): SongInfoViewProps => ({
            song: request.data,
            loading: request.loading,
            currentItem,
            playing: !isPaused && currentItem?.song?.id == request.data?.id,
        }))
    );

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }

    public forcePlay(song: Song) {
        this.player.playSingle(song, true);
    }

}