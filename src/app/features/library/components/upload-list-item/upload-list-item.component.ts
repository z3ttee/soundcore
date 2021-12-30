import { Component, Input, OnInit } from '@angular/core';
import { Upload } from '../../entities/upload.entity';

@Component({
  selector: 'asc-upload-list-item',
  templateUrl: './upload-list-item.component.html',
  styleUrls: ['./upload-list-item.component.scss']
})
export class UploadListItemComponent implements OnInit {

  @Input() public upload: Upload;

  constructor() { }

  ngOnInit(): void {
  }

}
