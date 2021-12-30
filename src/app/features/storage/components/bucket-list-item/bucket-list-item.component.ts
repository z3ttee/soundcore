import { Component, Input, OnInit } from '@angular/core';
import { StorageBucket } from '../../model/storage-bucket.model';

@Component({
  selector: 'asc-bucket-list-item',
  templateUrl: './bucket-list-item.component.html',
  styleUrls: ['./bucket-list-item.component.scss']
})
export class BucketListItemComponent implements OnInit {

  @Input() public bucket: StorageBucket;

  constructor() { }

  ngOnInit(): void {
  }

}
