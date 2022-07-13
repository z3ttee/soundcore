import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, Observable, of, Subject, takeUntil } from 'rxjs';
import { Playlist, SCDKPlaylistService, SCDKProfileService, User } from 'soundcore-sdk';

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
    private readonly activatedRoute: ActivatedRoute
  ) { }

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this._destroy)).subscribe((paramMap) => {
      this._profileSubject.next(null);
      this._loadingSubject.next(true);

      const profileId = paramMap.get("profileId");
      const request = profileId == "@me" ? this.profileService.findByCurrentUser() : this.profileService.findByUserId(profileId);

      request.pipe(catchError((err) => of(null))).subscribe((profile) => {
        this._profileSubject.next(profile);
        this._loadingSubject.next(false);

        this.playlistService.findByAuthor(profileId, { page: 0, size: 8 }).subscribe((response) => {
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
