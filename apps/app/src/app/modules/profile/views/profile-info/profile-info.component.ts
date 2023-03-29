import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Playlist, SCSDKPlaylistService, SCDKUserService, User, SCSDKProfileService, Artist } from '@soundcore/sdk';
import { Pageable } from '@soundcore/common';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss']
})
export class ProfileInfoComponent implements OnInit, OnDestroy {

  private readonly _destroy: Subject<void> = new Subject();
  private readonly _cancel: Subject<void> = new Subject();

  public loading: boolean = true;
  public profile: User = null;
  public playlists: Playlist[] = [];
  public artists: Artist[] = [];

  constructor(
    private readonly profileService: SCSDKProfileService,
    private readonly userService: SCDKUserService,
    private readonly playlistService: SCSDKPlaylistService,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this._destroy)).subscribe((paramMap) => {
      // Cancel ongoing requests
      this._cancel.next();

      // Reset state
      this.loading = true;
      this.profile = null;
      this.playlists = [];

      const profileId = paramMap.get("profileId");
      const request = profileId == "@me" ? this.userService.findByCurrentUser() : this.profileService.findByUserId(profileId);

      request.pipe(takeUntil(this._cancel)).subscribe((response) => {
        // TODO: Catch error from response object
        // Update state
        this.loading = false;
        this.profile = response.payload;

        // Fetch 8 playlists of a user
        this.playlistService.findByAuthor(profileId, new Pageable(0, 8)).pipe(takeUntil(this._cancel)).subscribe((response) => {
          this.playlists = response.payload?.items ?? [];
        });

        // Fetch top 5 artists of user
        this.profileService.findTopArtistsByUser(this.profile.id).pipe(takeUntil(this._cancel)).subscribe((response) => {
          this.artists = response.payload?.items ?? [];
          console.log(this.artists);
        });
      })
    })
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();

      this._cancel.next();
      this._cancel.complete();
  }
}
