import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { SCNGXTracklist, SCNGXTracklistBuilder } from '@soundcore/ngx';
import { Album, Artist, Future, Page, Pageable, Playlist, SCDKAlbumService, SCDKArtistService, SCSDKPlaylistService, toFutureCompat } from '@soundcore/sdk';
import { AUDIOWAVE_LOTTIE_OPTIONS } from 'src/app/constants';

interface ArtistInfoProps {
  artist?: Artist;
  tracklist?: SCNGXTracklist;
  currentlyPlaying?: any;

  albums?: Future<Page<Album>>;
  featAlbums?: Future<Page<Album>>;
  featPlaylists?: Future<Page<Playlist>>;

  playing?: boolean;
  loading?: boolean;
}

@Component({
  selector: 'app-artist-profile',
  templateUrl: './artist-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistProfileComponent implements OnInit, OnDestroy {

  constructor(
    private readonly artistService: SCDKArtistService,
    private readonly playlistService: SCSDKPlaylistService,
    private readonly albumService: SCDKAlbumService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly tracklistBuilder: SCNGXTracklistBuilder,
    // private readonly player: AppPlayerService
  ) { }

  private readonly _destroy: Subject<void> = new Subject();

  public readonly $props: Observable<ArtistInfoProps> = combineLatest([
    this.activatedRoute.paramMap.pipe(
      takeUntil(this._destroy), 
      // Get artist id from route
      map((params) => params.get("artistId") ?? null), 
      // Switch to request observable
      switchMap((artistId) => combineLatest([
        this.artistService.findById(artistId).pipe(toFutureCompat()),
        this.albumService.findByArtist(artistId, new Pageable(0, 12)).pipe(toFutureCompat(), startWith(Future.loading<Page<Album>>())),
        this.albumService.findFeaturedByArtist(artistId, new Pageable(0, 12)).pipe(toFutureCompat(), startWith(Future.loading<Page<Album>>())),
        this.playlistService.findByArtist(artistId, new Pageable(0, 12)).pipe(startWith(Future.loading<Page<Playlist>>())),
      ])), 
      // Map future
      map(([artistRequest, albumsRequest, featAlbumsRequest, featPlaylistsRequest]): [Future<SCNGXTracklist<Artist>>, Future<Page<Album>>, Future<Page<Album>>, Future<Page<Playlist>>] => ([
        {
          ...artistRequest,
          data: this.tracklistBuilder.forArtistTop(artistRequest.data, 5)
        },
        albumsRequest,
        featAlbumsRequest,
        featPlaylistsRequest
      ]))),
    // this.player.$current.pipe(takeUntil(this._destroy)),
    // this.player.$isPaused.pipe(takeUntil(this._destroy))
  ]).pipe(
    // Build props object
    map(([[tracklistRequest, albumsRequest, featAlbumsRequest, featPlaylistsRequest]]): ArtistInfoProps => ({
      loading: tracklistRequest.loading,
      artist: tracklistRequest.data?.context,
      // currentlyPlaying: currentItem,
      // playing: !isPaused && currentItem?.tracklist?.id == tracklistRequest.data?.id,
      tracklist: tracklistRequest.data,
      albums: albumsRequest,
      featAlbums: featAlbumsRequest,
      featPlaylists: featPlaylistsRequest
    })),
  );

  public featPlaylists: Playlist[] = [];

  // Lottie animations options
  public animOptions = AUDIOWAVE_LOTTIE_OPTIONS;

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this._destroy)).subscribe((paramMap) => {
      const artistId = paramMap.get("artistId");

      // Reset state
      this.featPlaylists = [];

      this.artistService.findById(artistId).pipe(takeUntil(this._destroy)).subscribe((response) => {
        const artist = response.payload;

        // this.playlistService.findByArtist(artistId, new Pageable(0, 12)).pipe(takeUntil(this._destroy)).subscribe((page) => {
        //   this._featPlaylistSubject.next(page?.elements || []);
        // });
      })
    })
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public forcePlay(tracklist: SCNGXTracklist) {
    // this.player.playTracklist(tracklist, true).subscribe();
  }

}
