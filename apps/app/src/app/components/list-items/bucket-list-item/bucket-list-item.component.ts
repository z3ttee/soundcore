import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Zone } from "@soundcore/sdk";

@Component({
  selector: 'app-bucket-list-item',
  templateUrl: './bucket-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BucketListItemComponent {

  @Input() 
  public bucket: Zone;

  @Input()
  public itemHeight: number = 64;

}
