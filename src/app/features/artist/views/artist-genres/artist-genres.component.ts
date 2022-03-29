import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { GenreService } from 'src/app/features/genre/services/genre.service';
import { Genre } from 'src/app/model/genre.entity';
import { ScrollService } from 'src/app/services/scroll.service';
import { Artist } from '../../entities/artist.entity';
import { ArtistService } from '../../services/artist.service';

@Component({
  templateUrl: './artist-genres.component.html',
  styleUrls: ['./artist-genres.component.scss']
})
export class ArtistGenresComponent implements OnInit, OnDestroy {

  private _destroySubject: Subject<void> = new Subject()
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Loading states
  public isLoading: boolean = false;

  // Data providers
  private _genresSubject: BehaviorSubject<Genre[]> = new BehaviorSubject([])
  public $genres: Observable<Genre[]> = this._genresSubject.asObservable();
  public artist: Artist = null;

  // Pagination
  private currentPage: number = 0;
  public totalElements: number = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private genreService: GenreService,
    private artistService: ArtistService,
    private scrollService: ScrollService
  ) { }

  public ngOnInit(): void {
    
    this.activatedRoute.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      // TODO: Implement error messages
      const artistId = paramMap.get("artistId")

      this.isLoading = true;
      this.artistService.findProfileById(artistId).then((artist) => {
        this.artist = artist;

        this.scrollService.$onBottomReached.pipe(takeUntil(this.$destroy)).subscribe(() => {
          this.findGenres();
        })
      }).finally(() => {
        this.isLoading = false;
      })
    })
  }

  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

  public async findGenres() {
    this.genreService.findGenresByArtist(this.artist?.id, { size: 50, page: this.currentPage }).then((page) => {
      this.totalElements = page.totalElements

      if(page.elements.length > 0) {
        this.currentPage++;
        this._genresSubject.next([
          ...this._genresSubject.getValue(),
          ...page.elements
        ])
      }
    })
  }

}
