import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { Song } from 'src/app/features/song/entities/song.entity';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { LikeService } from 'src/app/services/like.service';
import { ScrollService } from 'src/app/services/scroll.service';
import { ListCreator } from 'src/lib/data/list-creator';
import { PlayableList } from 'src/lib/data/playable-list.entity';
import { AuthenticationService } from 'src/sso/services/authentication.service';
import { Collection } from '../../entities/collection.entity';
import { CollectionService } from '../../services/collection.service';

@Component({
  templateUrl: './collection-info.component.html',
  styleUrls: ['./collection-info.component.scss']
})
export class CollectionInfoComponent implements OnInit, OnDestroy {

  constructor(
    private likeService: LikeService,
    private collectionService: CollectionService,
    private scrollService: ScrollService,
    public authService: AuthenticationService,
    private listCreator: ListCreator,
    private audioService: AudioService
  ) { }

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy = this._destroySubject.asObservable();

  // Data providers
  public $isPaused: Observable<boolean> = combineLatest([ this.audioService.$paused, this.audioService.$currentItem ]).pipe(takeUntil(this.$destroy), map(([paused, item]) => paused || item?.context?.context?.["id"] != this.collection?.id))

  public collection: Collection = null;
  public list: PlayableList<Collection> = null;

  // Loading states
  public isLoading: boolean = false;

  // Accent colors  
  public accentColor: string = "#FFBF50";

  public ngOnInit(): void {
    this.isLoading = true;

    this.collectionService.findCollection().then((collection) => {
      this.collection = collection;
      this.list = this.listCreator.forCollection(this.collection, this.authService.getUser()?.id);

      this.scrollService.$onBottomReached.pipe(takeUntil(this.$destroy)).subscribe(() => {
        this.findSongs();
      })
    }).finally(() => {
      this.isLoading = false
    })

    this.likeService.$onSongLike.pipe(takeUntil(this.$destroy)).subscribe((song) => {
        if(song.liked) this.addSong(song)
        else this.removeSong(song)
    })
  }

  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

  public async findSongs() {
    this.list.fetchNextPage();
  }

  public async addSong(song: Song) {
    this.list.addSong(song).then(() => {
      this.collection.songsCount++;
      this.collection.totalDuration += song.duration
    })
  }

  public async playOrPauseList() {
    this.audioService.playOrPauseList(this.list)
  }

  public async removeSong(song: Song) {
    this.list.removeSong(song).then(() => {
      this.collection.songsCount--;
      this.collection.totalDuration -= song.duration
    });
  }

}
