import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, filter, Observable, Subject, takeUntil } from 'rxjs';
import { Song } from 'src/app/features/song/entities/song.entity';
import { LikeService } from 'src/app/services/like.service';
import { ScrollService } from 'src/app/services/scroll.service';
import { AuthenticationService } from 'src/app/sso/authentication.service';
import { Collection } from '../../entities/collection.entity';
import { CollectionService } from '../../services/collection.service';

@Component({
  templateUrl: './collection-info.component.html',
  styleUrls: ['./collection-info.component.scss']
})
export class CollectionInfoComponent implements OnInit, OnDestroy {

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy = this._destroySubject.asObservable();

  // Data providers
  private _songsSubject: BehaviorSubject<Song[]> = new BehaviorSubject([]);

  public $songs: Observable<Song[]> = this._songsSubject.asObservable();
  public collection: Collection;

  // Pagination
  private currentPage: number = 0;

  // Loading states
  public isLoading: boolean = false;

  // Accent colors  
  public accentColor: string = "#FFBF50";

  constructor(
    private likeService: LikeService,
    private collectionService: CollectionService,
    private scrollService: ScrollService,
    public authService: AuthenticationService
  ) { }

  public ngOnInit(): void {
    this.isLoading = true;
    this.collectionService.findCollection().then((collection) => {
      this.collection = collection;

      this.scrollService.$onBottomReached.pipe(takeUntil(this.$destroy)).subscribe(() => {
        this.findSongs();
      })
    }).finally(() => {
      this.isLoading = false
    })

    this.likeService.$onSongLike.pipe(takeUntil(this.$destroy)).subscribe((song) => {
        if(song.isLiked) this.addSong(song)
        else this.removeSong(song)
    })
  }

  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

  public async findSongs() {
    this.collectionService.findSongsByCollection({
      page: this.currentPage
    }).then((page) => {
      if(page.elements.length > 0) this.currentPage++;
      this._songsSubject.next([
        ...this._songsSubject.getValue(),
        ...page.elements
      ])
    })
  }

  public async addSong(song: Song) {
    const songs = this._songsSubject.getValue();
    const existing = songs.find((s) => s?.id == song?.id);

    if(existing) {
      existing.isLiked = song?.isLiked
    } else {
      songs.push(song);
      this._songsSubject.next(songs);
      this.collection.songsCount++;
    }
  }

  public async removeSong(song: Song) {
    this._songsSubject.next(this._songsSubject.getValue().filter((s) => s?.id != song?.id))
    this.collection.songsCount--;
  }

}
