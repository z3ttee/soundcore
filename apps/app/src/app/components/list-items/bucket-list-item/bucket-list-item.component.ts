import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Zone } from "@repo/angular-sdk";

@Component({
  selector: 'app-bucket-list-item',
  templateUrl: './bucket-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class BucketListItemComponent {

  @Input()
  public zone: Zone;

  @Input()
  public itemHeight: number = 64;

}
