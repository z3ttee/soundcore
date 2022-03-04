import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { Song } from 'src/app/features/song/entities/song.entity';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { User } from 'src/app/features/user/entities/user.entity';
import { LikeService } from 'src/app/services/like.service';
import { ScrollService } from 'src/app/services/scroll.service';
import { AuthenticationService } from 'src/app/sso/authentication.service';
import { ListCreator } from 'src/lib/data/list-creator';
import { PlayableList } from 'src/lib/data/playable-list.entity';
import { Playlist } from '../../entities/playlist.entity';
import { PlaylistService } from '../../services/playlist.service';

@Component({
  templateUrl: './playlist-info.component.html',
  styleUrls: ['./playlist-info.component.scss']
})
export class PlaylistInfoComponent implements OnInit, OnDestroy {

  constructor(
    private activatedRoute: ActivatedRoute,
    private playlistService: PlaylistService,
    private authService: AuthenticationService,
    private scrollService: ScrollService,
    private likeService: LikeService,
    public audioService: AudioService,
    private listCreator: ListCreator
  ) { }

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
  public $songs: Observable<Song[]> = this._songsSubject.asObservable();

  public $user: Observable<User> = this.authService.$user.pipe(takeUntil(this.$destroy));

  // Pagination
  private currentPage: number = 0;
  public totalElements: number = 0;

  public async ngOnInit(): Promise<void> {
    this.activatedRoute.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      this.reset();

      this.playlistId = paramMap.get("playlistId");

      this.isLoading = true;
      // Find playlist by route parameter
      this.playlistService.findById(this.playlistId).then((playlist) => {

        // Update playlist and also playable list
        this.playlist = playlist;
        this.playableList = this.listCreator.forPlaylist(this.playlist);

        // Bind dataSource to component datasource
        this.$songs = this.playableList.$dataSource;
      }).finally(() => this.isLoading = false);

      this.scrollService.$onBottomReached.pipe(takeUntil(this.$destroy)).subscribe(() => this.findSongs())
      /*this.playlistService.$onSongsAdded.pipe(takeUntil(this.$destroy), filter((event) => event?.playlistId == this.playlistId), map((event) => event.songs)).subscribe((songs) => {
        this.addSongs(songs)
      })
      this.playlistService.$onSongsRemoved.pipe(takeUntil(this.$destroy), filter((event) => event?.playlistId == this.playlistId), map((event) => event.songs)).subscribe((songs) => {
        this.addSongs(songs)
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
    this.totalElements = 0;
    this.currentPage = 0;
  }

  public async findSongs() {
    this.playableList?.fetchNextPage()
  }

  public async playOrPauseList() {
    // TODO: Just a prototype
    const list = this.listCreator.forPlaylist(this.playlist);
    console.log(list)
    this.audioService.playList(list)
  }

  public async likePlaylist() {
    this.likeService.likePlaylist(this.playlist).then(() => {
      this.playlist.isLiked = !this.playlist?.isLiked;
    })
  }

  public async addSongs(songs: Song[]) {
    const songsArr = this._songsSubject.getValue();
    const songsArrIds = songsArr.map((song) => song?.id);
    
    songsArr.push(...songs.filter((song) => !songsArrIds.includes(song?.id)));
    this._songsSubject.next(songsArr);
  }

  public async removeSongs(songs: Song[]) {
    const songIds = songs.map((song) => song?.id);
    this._songsSubject.next(this._songsSubject.getValue().filter((song) => !songIds.includes(song?.id)));
  }

}
