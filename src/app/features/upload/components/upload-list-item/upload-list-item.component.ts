import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ConfirmAbortDialog } from '../../dialogs/confirm-abort/confirm-abort.component';
import { Index } from '../../entities/index.entity';
import { Upload } from '../../entities/upload.entity';
import { IndexStatus } from '../../enums/index-status.enum';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'asc-upload-list-item',
  templateUrl: './upload-list-item.component.html',
  styleUrls: ['./upload-list-item.component.scss']
})
export class UploadListItemComponent {

  private _upload: Upload;
  private _uploadSub: Subscription;

  public index: Index;
  public showProgress: boolean = true;

  @Input() public set upload(val: Upload) {
    if(this._uploadSub) this._uploadSub.unsubscribe();
    this._uploadSub = val.$index.subscribe((index) => {
      this.index = index;

      this.showProgress = this.index.status != IndexStatus.ERRORED;
    });

    this._upload = val;
  }

  public get upload(): Upload {
    return this._upload;
  }

  constructor(private uploadService: UploadService, private dialog: MatDialog) { }

  public abortUpload() {
    this.openConfirmDialog()
  }

  public retryUpload() {
    
  }

  public openConfirmDialog() {
    const dialogRef = this.dialog.open(ConfirmAbortDialog);

    dialogRef.afterClosed().subscribe(result => {
      if(result) this.uploadService.abortUpload(this.upload.id);
    });
  }

}
