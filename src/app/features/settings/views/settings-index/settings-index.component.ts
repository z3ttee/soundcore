import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { KeycloakService } from 'keycloak-angular';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { SettingsService } from 'src/app/services/settings.service';
import { AuthenticationService } from 'src/sso/services/authentication.service';

@Component({
  templateUrl: './settings-index.component.html',
  styleUrls: ['./settings-index.component.scss']
})
export class SettingsIndexComponent implements OnInit {

  constructor(
    private settingsService: SettingsService,
    public authService: AuthenticationService,
    private keycloakService: KeycloakService
  ) { }

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Form fields
  public enableAudioFadingControl: FormControl = new FormControl(this.settingsService.isAudioFadeAllowed());
  public showSessionKey: boolean = false;

  public ngOnInit(): void {
    this.enableAudioFadingControl.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((value: boolean) => {
      console.log(value)
      this.settingsService.setAudioFadeAllowed(value)
    })
  }

}
