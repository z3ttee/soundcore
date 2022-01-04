import { Component, OnInit } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { Socket } from 'socket.io-client';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Index } from '../../entities/index.entity';
import { Upload } from '../../entities/upload.entity';
import { IndexStatusService } from '../../services/index-status.service';
import { UploadService } from '../../services/upload.service';

@Component({
  templateUrl: './upload-index.component.html',
  styleUrls: ['./upload-index.component.scss']
})
export class UploadIndexComponent implements OnInit {

  public $queue: Observable<Upload[]>
  public $indexQueue: Observable<Index[]>

  constructor(
    public uploadService: UploadService,
    public indexStatusService: IndexStatusService,
    private authService: AuthenticationService
  ) {
    this.$queue = this.uploadService.$queue;
    this.$indexQueue = this.uploadService.$indexQueue;
  }

  ngOnInit(): void {}

  public async enqueueFiles(event: Event) {
    const files: FileList = event.target["files"];

    event.target["files"] = null
    for(let i = 0; i < files.length; i++) {
      await this.uploadService.enqueueFile(files.item(i))
    }
  }

  public async onStatusUpdate(index: Index) {
    this.uploadService.updateIndex(index)
  }

}
