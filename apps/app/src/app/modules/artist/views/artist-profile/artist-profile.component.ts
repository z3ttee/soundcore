import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, startWith, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Album, Artist, Future, PlayableEntityType, Playlist, SCDKAlbumService, SCSDKArtistService, SCSDKDatasource, SCSDKPlaylistService, SCSDKSongService, Song, toFutureCompat } from '@soundcore/sdk';
import { AUDIOWAVE_LOTTIE_OPTIONS } from 'src/app/constants';
import { Page, Pageable } from '@soundcore/common';
import { PlayerService } from 'src/app/modules/player/services/player.service';

interface ArtistInfoProps {
  artist?: Future<Artist>;
  albums?: Future<Page<Album>>;
  featAlbums?: Future<Page<Album>>;
  featPlaylists?: Future<Page<Playlist>>;

  isPlaying?: boolean;
  isTracklistActive?: boolean;
  currentItemId?: string;
}

@Component({
  selector: 'app-artist-profile',
  templateUrl: './artist-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistProfileComponent implements OnDestroy {

  constructor(
    private readonly artistService: SCSDKArtistService,
    private readonly songService: SCSDKSongService,
    private readonly playlistService: SCSDKPlaylistService,
    private readonly albumService: SCDKAlbumService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly playerService: PlayerService
  ) { }

  private readonly $destroy: Subject<void> = new Subject();

  /**
   * Observable that emits currently active
   * artistId extracted from the url.
   */
  public $artistId: Observable<string> = this.activatedRoute.paramMap.pipe(map((params) => params.get("artistId")));

  /**
   * Observable that emits current
   * artist data in future format
   */
  public $artist: Observable<Future<Artist>> = this.$artistId.pipe(switchMap((artistId) => this.artistService.findById(artistId).pipe(map((artist) => {
    if(artist.loading) return artist;
    // Change type to ARTIST_TOP so the player understands which tracklist to play
    if(artist.data) artist.data.type = PlayableEntityType.ARTIST_TOP;
    return artist;
  }))));
  
  /**
   * Observable that emits current datasource
   * of tracks
   */
  public $datasource: Observable<SCSDKDatasource<Song>> = this.$artistId.pipe(switchMap((artistId) => this.songService.findByArtistTopDatasource(artistId, 5)));

  public readonly $props: Observable<ArtistInfoProps> = combineLatest([
    this.$artist,
    // Find albums of artist
    this.$artistId.pipe(switchMap((artistId) => this.albumService.findByArtist(artistId, new Pageable(0, 12)).pipe(toFutureCompat(), startWith(Future.loading<Page<Album>>())))),
    // Find albums in which the artist is involved
    this.$artistId.pipe(switchMap((artistId) => this.albumService.findFeaturedByArtist(artistId, new Pageable(0, 12)).pipe(toFutureCompat(), startWith(Future.loading<Page<Album>>())))),
    // Find playlists with songs of the artist
    this.$artistId.pipe(switchMap((artistId) => this.playlistService.findByArtist(artistId, new Pageable(0, 12)).pipe(startWith(Future.loading<Page<Playlist>>())))),
    // Get currently played item
    this.playerService.$currentItem.pipe(takeUntil(this.$destroy)),
    // Get playback state
    this.playerService.$isPaused.pipe(takeUntil(this.$destroy))
  ]).pipe(
    // Build props object
    map(([artist, albums, featAlbums, featPlaylists, currentItem, isPaused]): ArtistInfoProps => {
      const currentTracklistId = currentItem?.tracklistId;
      const currentItemId = currentItem?.id;

      return {
        artist: artist,
        albums: albums,
        featAlbums: featAlbums,
        featPlaylists: featPlaylists,
        isPlaying: !isPaused && currentTracklistId === artist.data?.id,
        isTracklistActive: currentTracklistId === artist.data?.id,
        currentItemId: currentItemId
      }
    }),
    takeUntil(this.$destroy),
    tap((props) => console.log(props))
  );

  public ngOnDestroy(): void {
      this.$destroy.next();
      this.$destroy.complete();
  }

  public forcePlay(artist: Artist) {
    this.playerService.forcePlay(artist).subscribe();
  }

  public forcePlayAt(artist: Artist, indexAt: number, itemId: string) {
    this.playerService.forcePlayAt(artist, indexAt, itemId).subscribe();
  }

}
