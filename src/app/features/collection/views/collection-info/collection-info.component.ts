import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { Song } from 'src/app/features/song/entities/song.entity';
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
    private collectionService: CollectionService,
    private scrollService: ScrollService,
    public authService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.collectionService.findCollection().then((collection) => {
      this.collection = collection;

      this.scrollService.$onBottomReached.pipe(takeUntil(this.$destroy)).subscribe(() => {
        this.findSongs();
      })
    }).finally(() => {
      this.isLoading = false
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

}
