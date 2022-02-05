import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { PlayableList } from 'src/app/entities/playable-list.entity';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { User } from 'src/app/features/user/entities/user.entity';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import { AuthenticationService } from 'src/app/sso/authentication.service';

@Component({
  selector: 'asc-playlist-simple-list-item',
  templateUrl: './playlist-list-item.component.html',
  styleUrls: ['./playlist-list-item.component.scss']
})
export class PlaylistSimpleListItemComponent implements OnInit, OnDestroy {

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  constructor(
    public authService: AuthenticationService,
    public audioService: AudioService,
    private contextService: ContextMenuService
  ) { }

  // Props
  @Input() public playlist: Playlist;
  @Input() public routeActive: boolean = false;

  // Data providers
  public $user: Observable<User> = this.authService.$user.pipe(takeUntil(this.$destroy));

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  public async playList() {
    const list = PlayableList.forPlaylist(this.playlist.id, 0);
    this.audioService.playList(list);
    this.contextService.close();
  }

  public async enqueueList() {
    const list = PlayableList.forPlaylist(this.playlist.id, 0);
    this.audioService.enqueueList(list)
    this.contextService.close();
  }

}
