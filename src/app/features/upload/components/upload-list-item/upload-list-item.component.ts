import { Component, Input, OnInit } from '@angular/core';
import { Upload } from '../../entities/upload.entity';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'asc-upload-list-item',
  templateUrl: './upload-list-item.component.html',
  styleUrls: ['./upload-list-item.component.scss']
})
export class UploadListItemComponent implements OnInit {

  @Input() public upload: Upload;

  constructor(private uploadService: UploadService) { }

  ngOnInit(): void {
    console.log("list item onInit", this.upload)
  }

  public abortUpload() {
    this.uploadService.abortUpload(this.upload.id);
  }

}
