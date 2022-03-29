import { Component, Input, OnInit } from '@angular/core';
import { Bucket } from '../../entities/bucket.entity';

@Component({
  selector: 'asc-bucket-list-item',
  templateUrl: './bucket-list-item.component.html',
  styleUrls: ['./bucket-list-item.component.scss']
})
export class BucketListItemComponent implements OnInit {

  @Input() public bucket: Bucket;

  constructor() { }

  ngOnInit(): void {
  }

}
