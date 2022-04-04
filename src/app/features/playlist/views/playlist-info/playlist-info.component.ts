import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { Playlist, SCDKPlaylistService } from 'soundcore-sdk';
import { Song } from 'src/app/features/song/entities/song.entity';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { User } from 'src/app/features/user/entities/user.entity';
import { LikeService } from 'src/app/services/like.service';
import { ScrollService } from 'src/app/services/scroll.service';
import { ListCreator } from 'src/lib/data/list-creator';
import { PlayableList } from 'src/lib/data/playable-list.entity';
import { AuthenticationService } from 'src/sso/services/authentication.service';

@Component({
  templateUrl: './playlist-info.component.html',
  styleUrls: ['./playlist-info.component.scss']
})
export class PlaylistInfoComponent implements OnInit, OnDestroy {

  constructor(
    private activatedRoute: ActivatedRoute,
    private playlistService: SCDKPlaylistService,
    private authService: AuthenticationService,
    private scrollService: ScrollService,
    private likeService: LikeService,
    public audioService: AudioService,
    private listCreator: ListCreator
  ) { }

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Loading states
  public isLoading: boolean = false;
  public isAuthorLoading: boolean = false;

  // Data providers
  private _songsSubject: BehaviorSubject<Song[]> = new BehaviorSubject([]);

  public playlistId: string = null;
  public playlist: Playlist = null;
  public playableList: PlayableList<Playlist>;

  public $user: Observable<User> = this.authService.$user.pipe(takeUntil(this.$destroy));
  public $songs: Observable<Song[]> = this._songsSubject.asObservable();
  public $isPaused: Observable<boolean> = combineLatest([ this.audioService.$paused, this.audioService.$currentItem ]).pipe(takeUntil(this.$destroy), map(([paused, item]) => paused || item?.context?.context?.["id"] != this.playlistId))

  public async ngOnInit(): Promise<void> {
    this.activatedRoute.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      this.reset();

      this.playlistId = paramMap.get("playlistId");

      this.isLoading = true;
      // Find playlist by route parameter
      this.playlistService.findById(this.playlistId).pipe(takeUntil(this.$destroy)).subscribe((playlist) => {
        this.isLoading = false

        // Update playlist and also playable list
        this.playlist = playlist;
        this.playableList = this.listCreator.forPlaylist(this.playlist);

        // Bind dataSource to component datasource
        this.$songs = this.playableList.$dataSource;
      });

      this.scrollService.$onBottomReached.pipe(takeUntil(this.$destroy)).subscribe(() => this.findSongs())
      /*this.playlistService.$onSongsAdded.pipe(takeUntil(this.$destroy), filter((event) => event?.playlistId == this.playlistId), map((event) => event.songs)).subscribe((songs) => {
        this.playableList.addSongBulk(songs);
      })
      this.playlistService.$onSongsRemoved.pipe(takeUntil(this.$destroy), filter((event) => event?.playlistId == this.playlistId), map((event) => event.songs)).subscribe((songs) => {
        this.playableList.removeSongBulk(songs);
      })*/
    })
  }

  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

  public async reset() {
    this._songsSubject.next([]);
    this.playlist = null;
    this.playlistId = null;
  }

  public async findSongs() {
    console.log("find songs")
    this.playableList?.fetchNextPage()
  }

  public async playOrPauseList() {
    this.audioService.playOrPauseList(this.playableList)
  }

  public async likePlaylist() {
    this.likeService.likePlaylist(this.playlist).then(() => {
      // TODO: Use event this.playlist.isLiked = !this.playlist?.isLiked;
    })
  }

}
