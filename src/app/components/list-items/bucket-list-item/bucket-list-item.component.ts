import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Bucket } from "soundcore-sdk";

@Component({
  selector: 'app-bucket-list-item',
  templateUrl: './bucket-list-item.component.html',
  styleUrls: ['./bucket-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BucketListItemComponent implements OnInit {

  @Input() public bucket: Bucket;

  constructor() { }

  public ngOnInit(): void {}

}
