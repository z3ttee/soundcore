import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  templateUrl: './settings-index.component.html',
  styleUrls: ['./settings-index.component.scss']
})
export class SettingsIndexComponent implements OnInit {

  constructor(
    private settingsService: SettingsService
  ) { }

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Form fields
  public enableAudioFadingControl: FormControl = new FormControl(this.settingsService.isAudioFadeAllowed());

  public ngOnInit(): void {
    this.enableAudioFadingControl.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((value: boolean) => {
      console.log(value)
      this.settingsService.setAudioFadeAllowed(value)
    })
  }

}
