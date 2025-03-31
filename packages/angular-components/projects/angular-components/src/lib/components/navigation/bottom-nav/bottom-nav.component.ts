import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'scngx-bottom-nav',
    templateUrl: './bottom-nav.component.html',
    styleUrls: ['./bottom-nav.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SCNGXBottomNavComponent implements OnInit {

  constructor() { }

  public ngOnInit(): void {}

}
