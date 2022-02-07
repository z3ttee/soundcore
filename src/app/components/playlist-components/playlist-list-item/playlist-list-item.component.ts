import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { User } from 'src/app/features/user/entities/user.entity';
import { DeviceService } from 'src/app/services/device.service';
import { AuthenticationService } from 'src/app/sso/authentication.service';

@Component({
  selector: 'asc-playlist-list-item',
  templateUrl: './playlist-list-item.component.html',
  styleUrls: ['./playlist-list-item.component.scss']
})
export class PlaylistListItemComponent implements OnInit, OnDestroy {

  constructor(
    public authService: AuthenticationService,
    public audioService: AudioService,
    public deviceSerivce: DeviceService
  ) { }

  // Props
  @Input() public playlist: Playlist;
  @Input() public routeActive: boolean = false;
  @Input() public enableContextMenu: boolean = true;

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Data providers
  public $user: Observable<User> = this.authService.$user.pipe(takeUntil(this.$destroy));
  public $isDesktop: Observable<boolean> = this.deviceSerivce.$breakpoint.pipe(takeUntil(this.$destroy), map((bp) => bp.isDesktop))

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

}
