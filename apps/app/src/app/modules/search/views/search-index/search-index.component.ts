import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, debounceTime, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { SCCDKScreenService } from '@soundcore/cdk';
import { SCDKGenreService, MeiliAlbum, MeiliArtist, SCSDKSearchService, SCDKResource, MeiliPlaylist, Pageable, MeiliUser, SCDKUserService, SCDKArtistService, SCDKAlbumService, MeiliSong, SCSDKSongService, SCSDKPlaylistService } from '@soundcore/sdk';
import { MatSnackBar } from '@angular/material/snack-bar';

interface SearchIndexProps {
  query?: string;
  history?: SCDKResource[];

  hits?: SearchHits;

  isTouch?: boolean;
}

interface SearchHits {
  songs?: MeiliSong[];
  artists?: MeiliArtist[];
  albums?: MeiliAlbum[];
  playlists?: MeiliPlaylist[];
  users?: MeiliUser[];
}

@Component({
  selector: 'app-search-index',
  templateUrl: './search-index.component.html',
  styleUrls: ['./search-index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchIndexComponent implements OnInit, OnDestroy {

  constructor(
    private readonly httpClient: HttpClient,
    private readonly router: Router,
    private readonly searchService: SCSDKSearchService,

    private readonly userService: SCDKUserService,
    private readonly artistService: SCDKArtistService,
    private readonly albumService: SCDKAlbumService,
    private readonly genreService: SCDKGenreService,
    private readonly songService: SCSDKSongService,
    private readonly playlistService: SCSDKPlaylistService,

    private readonly screenService: SCCDKScreenService,
    private readonly snackbar: MatSnackBar
  ) { }

  private readonly $destroy: Subject<void> = new Subject();
  private readonly $cancel: Subject<void> = new Subject();

  public readonly searchInputControl: UntypedFormControl = new UntypedFormControl("");

  public $props: Observable<SearchIndexProps> = combineLatest([
    this.searchService.$recentlySearched.pipe(takeUntil(this.$destroy)),
    this.searchService.$onMainInput.pipe(debounceTime(300), tap((_) => this.cancelCurrentQuery()), takeUntil(this.$destroy)),
    this.screenService.$isTouch.pipe(takeUntil(this.$destroy))
  ]).pipe(
    switchMap(([history, query, isTouch]) => {
      return new Observable<SearchIndexProps>((subscriber) => {
        subscriber.add(combineLatest([
          // this.songService.searchSongs(query, new Pageable(0, 10)).pipe(takeUntil(this.$cancel)),
          of(null),
          this.artistService.searchArtist(query, new Pageable(0, 10)).pipe(takeUntil(this.$cancel)),
          this.albumService.searchAlbum(query, new Pageable(0, 10)).pipe(takeUntil(this.$cancel)),
          this.playlistService.searchPlaylist(query, new Pageable(0, 10)).pipe(takeUntil(this.$cancel)),
          this.userService.searchUser(query, new Pageable(0, 10)).pipe(takeUntil(this.$cancel))
        ]).subscribe(([songSearchReq, artistSearchReq, albumSearchReq, playlistSearchReq, userSearchReq]) => {
          const hits: SearchHits = {
            songs: (songSearchReq as any)?.payload?.hits ?? [],
            artists: artistSearchReq?.payload?.hits ?? [],
            albums: albumSearchReq?.payload?.hits ?? [],
            playlists: playlistSearchReq?.payload?.hits ?? [],
            users: userSearchReq?.payload?.hits ?? []
          }
          
          subscriber.next({
            hits: hits,
            query: query,
            history: history,
            isTouch: isTouch
          });
          subscriber.complete();
        }))
      })
    })
  );


  public ngOnInit(): void {
    // Push queries that were received from input on mobile devices.
    this.searchInputControl.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((value) => {
      this.searchService.emitMainInput(value);
    })
  }

  public ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();

    this.$cancel.next();
    this.$cancel.complete();
  }

  public routeToResult(route: any[], resource: SCDKResource) {
    this.searchService.addToSearchHistory(resource);
    this.router.navigate(route);
  }

  public removeFromSearch(song: MeiliSong) {
    this.searchService.removeFromHistory(song).pipe(takeUntil(this.$destroy)).subscribe((wasRemoved) => {
      if(wasRemoved) {
        this.snackbar.open(`Eintrag aus Suchverlauf gelöscht`, null, { duration: 5000 });
      } else {
        this.snackbar.open(`Es ist ein Fehler aufgetreten`, null, { duration: 5000 });
      }
    });
  }

  private cancelCurrentQuery() {
    this.$cancel.next();
  }

}
