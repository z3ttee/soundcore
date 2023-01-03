import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Mount } from "@soundcore/sdk";

@Component({
  selector: 'app-mount-list-item',
  templateUrl: './mount-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MountListItemComponent {

  @Input() 
  public mount: Mount;

  @Input()
  public itemHeight: number = 64;

  constructor() { }

}
