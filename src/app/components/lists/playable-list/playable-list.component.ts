import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { PlayableList } from 'src/lib/data/playable-list.entity';
import { ScrollService } from 'src/app/services/scroll.service';
import { combineLatest, map, Observable, Subject, takeUntil } from 'rxjs';
import { LikeService } from 'src/app/services/like.service';
import { SongContextMenuComponent } from '../../context-menus/song-context-menu/song-context-menu.component';
import { SCResourceList } from 'src/lib/data/resource';

@Component({
  selector: 'asc-playable-list',
  templateUrl: './playable-list.component.html',
  styleUrls: ['./playable-list.component.scss']
})
export class PlayableListComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(
    private scrollService: ScrollService,
    public audioService: AudioService,
    private likeService: LikeService,
  ) { }

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Props
  @Input() public list: PlayableList<any>;
  @Input() public showHeader: boolean = true;
  @Input() public showId: boolean = true;
  @Input() public showCover: boolean = true;
  @Input() public showAlbum: boolean = true;
  @Input() public showDate: boolean = true;
  @Input() public showCount: boolean = true;
  @Input() public useQueueView: boolean = false;

  @ViewChild("songMenu") public contextMenuRef: SongContextMenuComponent;

  public ngOnInit(): void {
    this.scrollService.$onBottomReached.pipe(takeUntil(this.$destroy)).subscribe(() => {
      this.fetchNextPage();
    })

    this.likeService.$onSongLike.pipe(takeUntil(this.$destroy)).subscribe((song) => {
      
    })

  }

  public ngAfterViewInit(): void {}

  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

  public async fetchNextPage() {
    combineLatest([
      this.list.$totalElements,
      this.list.$size
    ]).pipe(takeUntil(this.$destroy), map(([total, current]) => ({ total, current }))).subscribe((state) => {
      if(state.current < state.total) {
        this.list?.fetchNextPage();
      }
    })
  }

}
