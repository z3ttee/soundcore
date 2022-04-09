import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'scngx-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXBottomNavComponent implements OnInit {

  constructor() { }

  public ngOnInit(): void {}

}
