import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { Album } from 'src/app/features/album/entities/album.entity';
import { AlbumService } from 'src/app/features/album/services/album.service';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { LikeService } from 'src/app/services/like.service';
import { Song } from '../../entities/song.entity';
import { SongService } from '../../services/song.service';

@Component({
  selector: 'asc-song-info',
  templateUrl: './song-info.component.html',
  styleUrls: ['./song-info.component.scss']
})
export class SongInfoComponent implements OnInit, OnDestroy {

  constructor(
    public songService: SongService,
    private albumService: AlbumService,
    public audioService: AudioService,
    private likeService: LikeService,
    private activatedRoute: ActivatedRoute
  ) { }

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Data providers
  private songId: string;

  private _songSubject: BehaviorSubject<Song> = new BehaviorSubject(null);
  private _recommendedAlbumsSubject: BehaviorSubject<Album[]> = new BehaviorSubject([]);

  public $song: Observable<Song> = this._songSubject.asObservable().pipe(takeUntil(this.$destroy));
  public $recommendedAlbums: Observable<Album[]> = this._recommendedAlbumsSubject.asObservable().pipe(takeUntil(this.$destroy));
  public $dataSource: Observable<Song[]> = this._songSubject.asObservable().pipe(takeUntil(this.$destroy), map((song) => !song ? [] : [song]));

  public ngOnInit(): void {

    // Subscribe to route changes
    this.activatedRoute.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      this.songId = paramMap.get("songId")

      this.songService.findById(this.songId).then((song) => {
        this._songSubject.next(song);

        this.albumService.findRecommendedByArtist(song?.artists?.[0]?.id).then((page) => {
          this._recommendedAlbumsSubject.next(page.elements);
        })
      })
    })

    // Subscribe to like changes
    this.likeService.$onSongLike.pipe(takeUntil(this.$destroy), filter((song) => song.id == this.songId)).subscribe((song) => {
      this._songSubject.next(song);
    })

  }

  public ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  public likeSong() {
    this.likeService.likeSong(this._songSubject.getValue())
  }

  public playOrPause() {
    const song = this._songSubject.getValue();
    this.audioService.playOrPause(song);
  }

}
