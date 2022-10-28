import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'sccdk-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCCDKOverlayComponent implements OnInit {

  public $isActive: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() { }

  public ngOnInit(): void {}

}
