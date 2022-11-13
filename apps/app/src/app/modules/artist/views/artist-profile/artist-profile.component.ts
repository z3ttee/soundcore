import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SCNGXSongColConfig, SCNGXTracklist, SCNGXTracklistBuilder } from '@soundcore/ngx';
import { Album, Artist, Pageable, Playlist, SCDKAlbumService, SCDKArtistService, SCSDKPlaylistService } from '@soundcore/sdk';
import { AppPlayerService } from 'src/app/modules/player/services/player.service';

@Component({
  selector: 'app-artist-profile',
  templateUrl: './artist-profile.component.html',
  styleUrls: ['./artist-profile.component.scss'],
})
export class ArtistProfileComponent implements OnInit, OnDestroy {

  constructor(
    private readonly artistService: SCDKArtistService,
    private readonly albumService: SCDKAlbumService,
    private readonly playlistService: SCSDKPlaylistService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly tracklistBuilder: SCNGXTracklistBuilder,
    private readonly player: AppPlayerService
  ) { }

  private readonly _destroy: Subject<void> = new Subject();

  public loading: boolean = true;
  public artist: Artist = null;
  public albums: Album[] = [];
  public featAlbums: Album[] = [];
  public featPlaylists: Playlist[] = [];

  public readonly songListCols: SCNGXSongColConfig = {
    id: { enabled: true, collapseAt: 420 },
    cover: { enabled: true },
    count: { enabled: true, collapseAt: 450 },
    duration: { enabled: true, collapseAt: 380 }
  }

  public tracklist?: SCNGXTracklist;

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this._destroy)).subscribe((paramMap) => {
      const artistId = paramMap.get("artistId");

      // Reset state
      this.loading = true;
      this.artist = null;
      this.albums = [];
      this.featAlbums = [];
      this.featPlaylists = [];
      this.tracklist = null;

      this.artistService.findById(artistId).pipe(takeUntil(this._destroy)).subscribe((response) => {
        const artist = response.payload;

        // Update state
        this.loading = false;
        this.artist = artist;

        // Create tracklist
        this.tracklist = this.tracklistBuilder.forArtistTop(artist);

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

  public forcePlay() {
    this.player.playTracklist(this.tracklist, true);
  }

}
