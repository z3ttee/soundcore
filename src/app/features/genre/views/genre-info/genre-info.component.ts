import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { Album } from 'src/app/features/album/entities/album.entity';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { Song } from 'src/app/features/song/entities/song.entity';
import { SongService } from 'src/app/features/song/services/song.service';
import { Genre } from 'src/app/model/genre.entity';
import { Page, Pageable } from 'src/app/pagination/pagination';
import { ScrollService } from 'src/app/services/scroll.service';
import { GenreService } from '../../services/genre.service';

@Component({
  templateUrl: './genre-info.component.html',
  styleUrls: ['./genre-info.component.scss']
})
export class GenreInfoComponent implements OnInit, OnDestroy {

  private _destroySubject: Subject<void> = new Subject()
  private _songsPageSubject: BehaviorSubject<Page<Song>> = new BehaviorSubject(null);
  private _albumPageSubject: BehaviorSubject<Page<Album>> = new BehaviorSubject(null);
  private _playlistPageSubject: BehaviorSubject<Page<Playlist>> = new BehaviorSubject(null);

  // Destroy subscriptions
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Data providers
  public $songsPage: Observable<Page<Song>> = this._songsPageSubject.asObservable();
  public $albumPage: Observable<Page<Album>> = this._albumPageSubject.asObservable();
  public $playlistPage: Observable<Page<Playlist>> = this._playlistPageSubject.asObservable();
  public genre: Genre = null;

  // Loading states
  public isLoading: boolean = false;
  public isLoadingSongs: boolean = false;
  public isLoadingPlaylists: boolean = false;
  public isLoadingAlbums: boolean = false;

  // Error state
  public error: HttpErrorResponse = undefined

  constructor(
    private activatedRoute: ActivatedRoute,
    private genreService: GenreService,
    private songService: SongService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.activatedRoute.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      
      this.isLoading = true;
      this.genreService.findGenreById(paramMap.get("genreId"))
        .then((genre) => {
          this.genre = genre
          this.findSongs();
          this.findPlaylists();
          this.findAlbums();
        })
        .catch((reason) => this.error = reason)
        .finally(() => this.isLoading = false)
    })
  }

  public ngOnDestroy(): void {
      this._destroySubject.next()
      this._destroySubject.complete();
  }

  private async findSongs() {
    this.isLoadingSongs = true;
    this.songService.findByGenre(this.genre.id, { page: 0, size: 10 }).then((page) => {
      if(!page) page = Page.of([]);
      this._songsPageSubject.next(page)
    }).finally(() => {
      this.isLoadingSongs = false;
    })
  }

  private async findPlaylists() {
    this.isLoadingPlaylists = true;

    this.genreService.findPlaylistsByGenre(this.genre.id).then((page) => {
      this._playlistPageSubject.next(page)
    }).finally(() => {
      this.isLoadingPlaylists = false;
    })
  }

  private async findAlbums() {
    this.isLoadingAlbums = true;

    this.genreService.findAlbumByGenre(this.genre.id).then((page) => {
      this._albumPageSubject.next(page)
    }).finally(() => {
      this.isLoadingAlbums = false;
    })
  }

}
