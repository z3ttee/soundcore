import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, debounceTime, Observable, Subject, takeUntil } from 'rxjs';
import { SCCDKScreenService } from '@soundcore/cdk';
import { SCNGXInfiniteDataSource } from 'soundcore-ngx';
import { SCDKGenreService, MeiliAlbum, MeiliArtist, SCDKSearchService, ComplexSearchResult, SCDKResource, ApiSearchResponse, MeiliPlaylist, Pageable, MeiliUser, SCDKUserService, SCDKArtistService, SCDKAlbumService, Genre, MeiliSong, SCDKSongService, SCDKPlaylistService } from '@soundcore/sdk';

@Component({
  selector: 'app-search-index',
  templateUrl: './search-index.component.html',
  styleUrls: ['./search-index.component.scss']
})
export class SearchIndexComponent implements OnInit, OnDestroy {

  constructor(
    private readonly httpClient: HttpClient,
    private readonly router: Router,
    private readonly searchService: SCDKSearchService,

    private readonly userService: SCDKUserService,
    private readonly artistService: SCDKArtistService,
    private readonly albumService: SCDKAlbumService,
    private readonly genreService: SCDKGenreService,
    private readonly songService: SCDKSongService,
    private readonly playlistService: SCDKPlaylistService,

    public readonly screenService: SCCDKScreenService
  ) { }

  private readonly _destroy: Subject<void> = new Subject();
  private readonly _cancelQuery: Subject<void> = new Subject();

  private readonly _resultSubject: BehaviorSubject<ComplexSearchResult> = new BehaviorSubject(null);
  public readonly $recently: Observable<SCDKResource[]> = this.searchService.$recentlySearched.pipe(takeUntil(this._destroy));

  public show404: boolean = false;
  public query: string = "";
  public readonly searchInputControl: UntypedFormControl = new UntypedFormControl("");

  public $playlists: BehaviorSubject<ApiSearchResponse<MeiliPlaylist>> = new BehaviorSubject(null);
  public $users: BehaviorSubject<ApiSearchResponse<MeiliUser>> = new BehaviorSubject(null);
  public $artists: BehaviorSubject<ApiSearchResponse<MeiliArtist>> = new BehaviorSubject(null);
  public $albums: BehaviorSubject<ApiSearchResponse<MeiliAlbum>> = new BehaviorSubject(null);
  public $songs: BehaviorSubject<ApiSearchResponse<MeiliSong>> = new BehaviorSubject(null);

  public dataSource: SCNGXInfiniteDataSource<Genre> = new SCNGXInfiniteDataSource(this.httpClient, {
    url: this.genreService.buildFindAllUrl()
  });

  public ngOnInit(): void {
    this.searchService.$onMainInput.pipe(debounceTime(300), takeUntil(this._destroy)).subscribe((query) => {
      this._cancelQuery.next();
      this.query = query;

      if(typeof query == "undefined" || query == null || query.replace(/\s/g, '') == "") {
        this._resultSubject.next(null);
        this.show404 = false;
        return
      }

      // Search songs
      this.songService.searchSongs(query, new Pageable(0, 10)).pipe(takeUntil(this._cancelQuery)).subscribe((response) => {
        this.$songs.next(response.payload);
      })

      // Search artists
      this.artistService.searchArtist(query, new Pageable(0, 10)).pipe(takeUntil(this._cancelQuery)).subscribe((response) => {
        this.$artists.next(response.payload);
      })

      // Search albums
      this.albumService.searchAlbum(query, new Pageable(0, 10)).pipe(takeUntil(this._cancelQuery)).subscribe((response) => {
        this.$albums.next(response.payload);
      })

      // Search playlists
      this.playlistService.searchPlaylist(query, new Pageable(0, 10)).pipe(takeUntil(this._cancelQuery)).subscribe((response) => {
        this.$playlists.next(response.payload);
      })



      // Search users
      this.userService.searchUser(query, new Pageable(0, 10)).pipe(takeUntil(this._cancelQuery)).subscribe((response) => {
        this.$users.next(response.payload);
      })

    })

    // Push queries that were received from input on mobile devices.
    this.searchInputControl.valueChanges.pipe(takeUntil(this._destroy)).subscribe((value) => {
      this.searchService.emitMainInput(value);
    })
  }

  public ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();

    this._cancelQuery.next();
    this._cancelQuery.complete();
  }

  public routeToResult(route: any[], resource: SCDKResource) {
    this.searchService.addToSearchHistory(resource);
    this.router.navigate(route);
  }

}
