import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Album, Future, Page, SCDKAlbumService, toFutureCompat } from '@soundcore/sdk';
import { SCNGXSongColConfig, SCNGXTracklist, SCNGXTracklistBuilder } from '@soundcore/ngx';
import { AppPlayerService } from 'src/app/modules/player/services/player.service';
import { PlayerItem } from 'src/app/modules/player/entities/player-item.entity';

interface AlbumInfoProps {
  album?: Album;
  tracklist?: SCNGXTracklist;
  currentlyPlaying?: PlayerItem;

  featuredAlbums?: Album[];

  playing?: boolean;
  loading?: boolean;
}

@Component({
  templateUrl: './album-info.component.html',
  styleUrls: ['./album-info.component.scss']
})
export class AlbumInfoComponent implements OnInit, OnDestroy {

  constructor(
    private readonly albumService: SCDKAlbumService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly tracklistBuilder: SCNGXTracklistBuilder,
    private readonly player: AppPlayerService
  ) { }

  private readonly _destroy: Subject<void> = new Subject();
  private readonly _cancel: Subject<void> = new Subject();

  public columns: SCNGXSongColConfig = {
    id: { enabled: true, collapseAt: 420 },
    count: { enabled: true, collapseAt: 560 },
    duration: { enabled: true, collapseAt: 0 }
  }

  public readonly $props: Observable<AlbumInfoProps> = combineLatest([
    this.activatedRoute.paramMap.pipe(
      takeUntil(this._destroy), 
      // Get artist id from route
      map((params) => params.get("albumId") ?? null), 
      // Switch to request observable
      switchMap((albumId) => this.albumService.findById(albumId).pipe(
        takeUntil(this._cancel),
        toFutureCompat(),
        // Build a new tracklist for album data
        map((albumFuture): Future<SCNGXTracklist<Album>> => ({
          loading: albumFuture.loading,
          error: albumFuture.error,
          data: this.tracklistBuilder.forAlbum(albumFuture.data)
        })),
        // Request recommended albums for artist.
        switchMap((tracklistFuture) => {
          // If album still loading
          if(tracklistFuture.loading) return of([tracklistFuture, { loading: true }] as [Future<SCNGXTracklist>, Future<Page<Album>>]);
          const album = tracklistFuture.data?.context;

          return this.albumService.findRecommendedByArtist(album?.primaryArtist?.id, [ album?.id ]).pipe(
            takeUntil(this._cancel),
            toFutureCompat(),
            map((featAlbumsRequest): [Future<SCNGXTracklist>, Future<Page<Album>>] => ([ tracklistFuture, featAlbumsRequest ])),
          );
        }),
      )), 
      // Map future
      map(([tracklistFuture, featuredAlbumFuture]): Future<[SCNGXTracklist, Page<Album>]> => ({
        loading: tracklistFuture.loading,
        error: tracklistFuture.error ?? featuredAlbumFuture.error,
        data: [
          tracklistFuture.data,
          featuredAlbumFuture?.data as Page<Album>
        ]
      }))
    ),
    this.player.$current.pipe(takeUntil(this._destroy)),
    this.player.$isPaused.pipe(takeUntil(this._destroy))
  ]).pipe(
    // Build props object
    map(([future, currentItem, isPaused]): AlbumInfoProps => {
      const tracklist = future.data[0];
      const albums = future.data?.[1];

      return {
        loading: future.loading,
        album: tracklist?.context,
        currentlyPlaying: currentItem,
        playing: !isPaused && currentItem?.tracklist?.assocResId == tracklist?.assocResId,
        tracklist: tracklist,
        featuredAlbums: albums?.elements
      };
    }),
  );

  public ngOnInit(): void {
    
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();

      this._cancel.next();
      this._cancel.complete();
  }

  public forcePlay(tracklist: SCNGXTracklist) {
    this.player.playTracklist(tracklist, true);
  }

}
