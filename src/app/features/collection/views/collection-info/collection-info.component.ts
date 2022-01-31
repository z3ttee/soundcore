import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Song } from 'src/app/features/song/entities/song.entity';
import { ScrollService } from 'src/app/services/scroll.service';
import { AuthenticationService } from 'src/app/sso/authentication.service';
import { Collection } from '../../entities/collection.entity';
import { CollectionService } from '../../services/collection.service';

@Component({
  templateUrl: './collection-info.component.html',
  styleUrls: ['./collection-info.component.scss']
})
export class CollectionInfoComponent implements OnInit {

  private _destroySubject = new Subject();
  private $destroy = this._destroySubject.asObservable();

  public collection: Collection;
  public songs: Song[] = [] // TODO: Implement infinite scroll
  private currentPage: number = -1;

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
        this.collectionService.findSongsByCollection({
          page: ++this.currentPage,
          size: 30
        }).then((page) => {
          this.songs.push(...page.elements)
        })
      })
    }).finally(() => {
      this.isLoading = false
    })
  }

}
