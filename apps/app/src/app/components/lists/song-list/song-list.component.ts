import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { PlayableEntity, SCSDKBaseDatasource, Song } from "@soundcore/sdk";
import { BehaviorSubject, Observable, Subject, combineLatest, map, startWith, takeUntil } from "rxjs";
import { AUDIOWAVE_LOTTIE_OPTIONS } from "src/app/constants";
import { PlayerService } from "src/app/modules/player/services/player.service";

interface PlayerInfo {
    currentItemId?: string;
    isPlaying?: boolean;
    isOwnerActive?: boolean;
}

@Component({
    selector: "scngx-song-list",
    templateUrl: "./song-list.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SongListComponent implements AfterViewInit {

    constructor(
        private readonly player: PlayerService
    ) {}

    private readonly $destroy: Subject<void> = new Subject();

    @ViewChild(CdkVirtualScrollViewport)
    public element: CdkVirtualScrollViewport;

    private readonly _scrolledIndexChanged = new BehaviorSubject<number>(0);
    public readonly $scrolledIndexChanged = this._scrolledIndexChanged.asObservable();

    public readonly $playerInfo: Observable<PlayerInfo> = combineLatest([
        // Get paused state
        this.player.$isPaused.pipe(startWith(true)), 
    // Get current tracklist id
        this.player.$currentItem.pipe(startWith(null)),
    ]).pipe(map(([isPaused, currentItem]): PlayerInfo => {
        return {
            isPlaying: !isPaused,
            currentItemId: currentItem?.id,
            isOwnerActive: this.owner?.id === currentItem?.tracklistId,
        }
    }));

    // Lottie animations options
    public animOptions = AUDIOWAVE_LOTTIE_OPTIONS;

    @Input()
    public startIndex?: number;

    @Input()
    public useParentScroll?: boolean;

    @Input()
    public useParentPadding?: boolean;

    @Input()
    public owner: PlayableEntity;

    @Input()
    public datasource: Song[] | SCSDKBaseDatasource<Song>;

    @Output()
    public onPlay: EventEmitter<Song> = new EventEmitter();

    @Output()
    public onLike: EventEmitter<Song> = new EventEmitter();

    public ngAfterViewInit(): void {
        this.element.scrolledIndexChange.pipe(takeUntil(this.$destroy)).subscribe((scrollIndexChanged) => {
            this._scrolledIndexChanged.next(scrollIndexChanged);
        });
    }

    public ngTrackBy(index: number, item: Song): string {
        const key = `${index}-${item?.id}`;
        return key;
    }

    public handleOnLike(item: Song) {
        this.onLike.next(item);
    }

    public forcePlayAt(owner: PlayableEntity, indexAt: number, itemId: string) {
        this.player.forcePlayAt(owner, indexAt, itemId).pipe(takeUntil(this.$destroy)).subscribe();
    }

}