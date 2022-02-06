import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { PlayableList } from 'src/app/entities/playable-list.entity';
import { Song } from 'src/app/features/song/entities/song.entity';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { ScrollService } from 'src/app/services/scroll.service';
import { Playlist } from '../../entities/playlist.entity';
import { PlaylistService } from '../../services/playlist.service';

@Component({
  templateUrl: './playlist-info.component.html',
  styleUrls: ['./playlist-info.component.scss']
})
export class PlaylistInfoComponent implements OnInit, OnDestroy {

  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Loading states
  public isLoading: boolean = false;
  public isAuthorLoading: boolean = false;

  // Data providers
  private _songsSubject: BehaviorSubject<Song[]> = new BehaviorSubject([]);

  public playlistId: string = null;
  public playlist: Playlist = null;
  public $songs: Observable<Song[]> = this._songsSubject.asObservable();

  // Pagination
  private currentPage: number = 0;
  public totalElements: number = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private playlistService: PlaylistService,
    private scrollService: ScrollService,
    public audioService: AudioService
  ) { }

  public async ngOnInit(): Promise<void> {
    this.activatedRoute.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      this.reset();

      this.playlistId = paramMap.get("playlistId");

      this.isLoading = true;
      this.playlistService.findById(this.playlistId).then((playlist) => {
        this.playlist = playlist;
      }).finally(() => this.isLoading = false);

      this.scrollService.$onBottomReached.pipe(takeUntil(this.$destroy)).subscribe(() => this.findSongs())
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
    this.playlistService.findSongsByPlaylist(this.playlistId, { page: this.currentPage }).then((page) => {
      this.totalElements = page.totalElements;
      if(page.elements.length > 0) this.currentPage++;
      this._songsSubject.next([
        ...this._songsSubject.getValue(),
        ...page.elements
      ])
    });
  }

  public async playOrPauseList() {
    // TODO: Just a prototype
    const playlist: PlayableList = PlayableList.forPlaylist(this.playlistId, 0);
    console.log(playlist)
    this.audioService.playList(playlist)
  }

}
