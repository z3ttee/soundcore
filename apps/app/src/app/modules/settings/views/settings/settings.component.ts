import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { SCSDKSettingsService } from 'soundcore-sdk';
import { Subject, takeUntil } from 'rxjs';
import { SSOService } from '@soundcore/sso';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  private readonly _destroy: Subject<void> = new Subject();

  public readonly audioFormGroup: UntypedFormGroup = new UntypedFormGroup({
    audioFadingControl: new UntypedFormControl(true)
  })

  constructor(
    private readonly settingsService: SCSDKSettingsService,
    public readonly authService: SSOService
  ) { }

  public ngOnInit(): void {
    this.audioFormGroup.get("audioFadingControl").valueChanges.pipe(takeUntil(this._destroy)).subscribe((enabled: boolean) => {
      console.log(enabled);
    })
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

}
