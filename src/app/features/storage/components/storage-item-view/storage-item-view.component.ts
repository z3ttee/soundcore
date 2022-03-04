import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Index } from 'src/app/features/upload/entities/index.entity';
import { Bucket } from '../../entities/bucket.entity';
import { Mount } from '../../entities/mount.entity';

@Component({
  selector: 'asc-storage-item-view',
  templateUrl: './storage-item-view.component.html',
  styleUrls: ['./storage-item-view.component.scss']
})
export class StorageItemViewComponent implements OnInit {

  @Input() public type: "mount" | "bucket" | "index" = "index";
  @Input() public item: Mount | Bucket | Index;
  @Input() public error: HttpErrorResponse | Error | string;

  constructor() { }

  ngOnInit(): void {
    
  }

}
