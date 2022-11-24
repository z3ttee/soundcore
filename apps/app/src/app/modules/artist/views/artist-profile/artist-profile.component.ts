import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { SCNGXSongColConfig, SCNGXTracklist, SCNGXTracklistBuilder } from '@soundcore/ngx';
import { Album, Artist, Pageable, Playlist, SCDKAlbumService, SCDKArtistService, toFutureCompat } from '@soundcore/sdk';
import { AppPlayerService } from 'src/app/modules/player/services/player.service';
import { PlayerItem } from 'src/app/modules/player/entities/player-item.entity';

interface ArtistInfoProps {
  artist?: Artist;
  tracklist?: SCNGXTracklist;
  currentlyPlaying?: PlayerItem;

  playing?: boolean;
  loading?: boolean;
}

@Component({
  selector: 'app-artist-profile',
  templateUrl: './artist-profile.component.html',
  styleUrls: ['./artist-profile.component.scss'],
})
export class ArtistProfileComponent implements OnInit, OnDestroy {

  constructor(
    private readonly artistService: SCDKArtistService,
    private readonly albumService: SCDKAlbumService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly tracklistBuilder: SCNGXTracklistBuilder,
    private readonly player: AppPlayerService
  ) { }

  private readonly _destroy: Subject<void> = new Subject();

  public readonly $props: Observable<ArtistInfoProps> = combineLatest([
    this.activatedRoute.paramMap.pipe(
      takeUntil(this._destroy), 
      // Get artist id from route
      map((params) => params.get("artistId") ?? null), 
      // Switch to request observable
      switchMap((artistId) => this.artistService.findById(artistId).pipe(toFutureCompat())), 
      // Map future
      map((future) => ({
        ...future,
        data: this.tracklistBuilder.forArtistTop(future.data)
      }))),
    this.player.$current.pipe(takeUntil(this._destroy)),
    this.player.$isPaused.pipe(takeUntil(this._destroy))
  ]).pipe(
    // Build props object
    map(([future, currentItem, isPaused]): ArtistInfoProps => ({
      loading: future.loading,
      artist: future.data?.context,
      currentlyPlaying: currentItem,
      playing: !isPaused && currentItem?.tracklist?.assocResId == future.data?.assocResId,
      tracklist: future.data
    })),
  );

  public albums: Album[] = [];
  public featAlbums: Album[] = [];
  public featPlaylists: Playlist[] = [];

  public readonly songListCols: SCNGXSongColConfig = {
    id: { enabled: true, collapseAt: 420 },
    cover: { enabled: true },
    count: { enabled: true, collapseAt: 450 },
    duration: { enabled: true, collapseAt: 380 }
  }

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this._destroy)).subscribe((paramMap) => {
      const artistId = paramMap.get("artistId");

      // Reset state
      this.albums = [];
      this.featAlbums = [];
      this.featPlaylists = [];

      this.artistService.findById(artistId).pipe(takeUntil(this._destroy)).subscribe((response) => {
        const artist = response.payload;

        // Find list of albums by the artist
        this.albumService.findByArtist(artistId, new Pageable(0, 12)).pipe(takeUntil(this._destroy)).subscribe((response) => {
          // Update state
          this.albums = response.payload?.elements ?? [];
        });

        // this.playlistService.findByArtist(artistId, new Pageable(0, 12)).pipe(takeUntil(this._destroy)).subscribe((page) => {
        //   this._featPlaylistSubject.next(page?.elements || []);
        // });

        // Find list of albums the artist is featured in
        this.albumService.findFeaturedByArtist(artistId, new Pageable(0, 12)).pipe(takeUntil(this._destroy)).subscribe((response) => {
          // Update state
          this.featAlbums = response.payload?.elements ?? [];
        });
      })
    })
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public forcePlay(tracklist: SCNGXTracklist) {
    this.player.playTracklist(tracklist, true);
  }

}
