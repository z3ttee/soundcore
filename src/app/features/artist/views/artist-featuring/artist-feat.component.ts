import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Album } from 'src/app/features/album/entities/album.entity';
import { ScrollService } from 'src/app/services/scroll.service';
import { Artist } from '../../entities/artist.entity';
import { ArtistService } from '../../services/artist.service';

@Component({
  templateUrl: './artist-feat.component.html',
  styleUrls: ['./artist-feat.component.scss']
})
export class ArtistFeaturedComponent implements OnInit, OnDestroy {

  private _destroySubject: Subject<void> = new Subject()
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Data providers
  public albums: Album[] = [];

  public artistId: string = null;
  public artist: Artist = null;

  // Pagination
  private currentPage: number = 0;
  public totalElements: number = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private artistService: ArtistService,
    private scrollService: ScrollService
  ) { }

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      this.artistId = paramMap.get("artistId");
      
      this.artistService.findProfileById(this.artistId).then((artist) => this.artist = artist)
      
      this.scrollService.$onBottomReached.pipe(takeUntil(this.$destroy)).subscribe(() => this.findAlbums())
    })
  }

  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

  public async findAlbums() {
    this.artistService.findFeaturedAlbumsWithArtist(this.artistId, { page: this.currentPage }).then((page) => {
      this.totalElements = page.totalElements;
      if(page.elements.length > 0) this.currentPage++;
      this.albums.push(...page.elements);
    })
  }

}
