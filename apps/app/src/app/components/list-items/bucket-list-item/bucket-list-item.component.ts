import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Bucket } from "@soundcore/sdk";

@Component({
  selector: 'app-bucket-list-item',
  templateUrl: './bucket-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BucketListItemComponent {

  @Input() 
  public bucket: Bucket;

  @Input()
  public itemHeight: number = 64;

}
