import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'scngx-ui-section-title',
  templateUrl: './ui-section-title.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXUiSectionTitleComponent {

  /**
   * By specifying a route, clicking on the title will
   * result in navigating to the given route.
   */
  @Input()
  public route: string | any[];

}
