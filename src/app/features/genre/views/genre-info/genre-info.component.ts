import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Song } from 'src/app/features/song/entities/song.entity';
import { SongService } from 'src/app/features/song/services/song.service';
import { Genre } from 'src/app/model/genre.entity';
import { Page, Pageable } from 'src/app/pagination/pagination';
import { GenreService } from '../../services/genre.service';

@Component({
  templateUrl: './genre-info.component.html',
  styleUrls: ['./genre-info.component.scss']
})
export class GenreInfoComponent implements OnInit {

  private _songsPageSubject: BehaviorSubject<Page<Song>> = new BehaviorSubject(null);
  public $songsPage: Observable<Page<Song>> = this._songsPageSubject.asObservable();

  public genre: Genre = null;
  public isLoading: boolean = false;
  public isLoadingSongs: boolean = false;

  public error: HttpErrorResponse = undefined

  public pageSizeOptions: number[] = [25, 50, 100];
  public selectedPageSize: number = 25;
  public currentPageIndex: number = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private genreService: GenreService,
    private songService: SongService
  ) {}

  public async ngOnInit(): Promise<void> {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      console.log(paramMap.get("genreId"))

      this.isLoading = true;
      this.genreService.findGenreById(paramMap.get("genreId"))
        .then((genre) => {
          this.genre = genre
          this.findSongs();
        })
        .catch((reason) => this.error = reason)
        .finally(() => this.isLoading = false)
    })
  }

  public onPageEvent(event: PageEvent): void {
    this.selectedPageSize = event.pageSize;
    this.currentPageIndex = event.pageIndex;

    this.findSongs()
  }

  private async findSongs(pageable: Pageable = { page: this.currentPageIndex, size: this.selectedPageSize }) {
    this.isLoadingSongs = true;
    this.songService.findByGenre(this.genre.id, pageable).then((page) => {
      if(!page) page = Page.of([]);
      this._songsPageSubject.next(page)
    }).finally(() => {
      this.isLoadingSongs = false;
    })
  }

}
