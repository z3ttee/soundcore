import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, debounceTime, map, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { SCDKProfileService, User } from 'soundcore-sdk';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss']
})
export class ProfileInfoComponent implements OnInit, OnDestroy {

  private readonly _destroy: Subject<void> = new Subject();

  private readonly _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private readonly _profileSubject: BehaviorSubject<User> = new BehaviorSubject(null);

  public readonly $loading: Observable<boolean> = this._loadingSubject.asObservable().pipe(takeUntil(this._destroy));
  public readonly $profile: Observable<User> = this._profileSubject.asObservable().pipe(takeUntil(this._destroy));

  constructor(
    private readonly profileService: SCDKProfileService,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  /*public readonly $profile: Observable<User> = this.activatedRoute.paramMap.pipe(
    map((paramMap) => paramMap.get("profileId")),
    tap(() => this._loadingSubject.next(true)),
    switchMap((profileId) => {
      if(profileId == "@me") return this.profileService.findByCurrentUser();
      return this.profileService.findByUserId(profileId)
    }),
    catchError((err) => {
      console.error(err);
      return of(null);
    }),
    tap((profile) => {
      console.log(profile)
      this._loadingSubject.next(false)
    }),
    takeUntil(this._destroy)
  );*/

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this._destroy)).subscribe((paramMap) => {
      this._profileSubject.next(null);
      this._loadingSubject.next(true);

      const profileId = paramMap.get("profileId");
      const request = profileId == "@me" ? this.profileService.findByCurrentUser() : this.profileService.findByUserId(profileId);

      request.subscribe((profile) => {
        this._profileSubject.next(profile);
        this._loadingSubject.next(false);
      })
    })
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

}
