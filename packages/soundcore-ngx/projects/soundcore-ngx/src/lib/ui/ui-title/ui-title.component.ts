import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'scngx-ui-title',
  templateUrl: './ui-title.component.html',
  styleUrls: ['./ui-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXUiTitleComponent {

  /**
   * By specifying a route, clicking on the title will
   * result in navigating to the given route.
   */
  @Input()
  public route: string | any[];

  /**
   * Property that inverts the order of displaying
   * subtitle and title. If true, the subtitle will be
   * placed above the title.
   */
  @Input()
  public inverted: boolean = false;

  constructor() { }

}
