import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { Pageable, Playlist, SCDKPlaylistService, SCDKProfileService, SCDKUserService, User } from 'soundcore-sdk';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss']
})
export class ProfileInfoComponent implements OnInit, OnDestroy {

  private readonly _destroy: Subject<void> = new Subject();

  private readonly _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private readonly _profileSubject: BehaviorSubject<User> = new BehaviorSubject(null);
  private readonly _playlistSubject: BehaviorSubject<Playlist[]> = new BehaviorSubject([]);

  public readonly $loading: Observable<boolean> = this._loadingSubject.asObservable().pipe(takeUntil(this._destroy));
  public readonly $profile: Observable<User> = this._profileSubject.asObservable().pipe(takeUntil(this._destroy));
  public readonly $playlists: Observable<Playlist[]> = this._playlistSubject.asObservable().pipe(takeUntil(this._destroy));

  constructor(
    private readonly profileService: SCDKProfileService,
    private readonly playlistService: SCDKPlaylistService,
    private readonly userService: SCDKUserService,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this._destroy)).subscribe((paramMap) => {
      this._profileSubject.next(null);
      this._loadingSubject.next(true);

      const profileId = paramMap.get("profileId");
      const request = profileId == "@me" ? this.userService.findByCurrentUser() : this.profileService.findByUserId(profileId);

      request.subscribe((response) => {
        // TODO: Catch error from response object
        this._profileSubject.next(response.payload);
        this._loadingSubject.next(false);

        this.playlistService.findByAuthor(profileId, new Pageable(0, 8)).subscribe((response) => {
          this._playlistSubject.next(response.payload.elements);
        })
      })
    })
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }
}
