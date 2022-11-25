import { Component, Input } from '@angular/core';

@Component({
  selector: 'scngx-ui-section-title',
  templateUrl: './ui-section-title.component.html'
})
export class SCNGXUiSectionTitleComponent {

  @Input()
  public route: string | any[];

}
