import { Component, OnInit } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Index } from '../../entities/index.entity';
import { Upload } from '../../entities/upload.entity';
import { IndexStatus } from '../../enums/index-status.enum';
import { IndexStatusService } from '../../services/index-status.service';
import { UploadService } from '../../services/upload.service';

@Component({
  templateUrl: './upload-index.component.html',
  styleUrls: ['./upload-index.component.scss']
})
export class UploadIndexComponent implements OnInit {

  public $queue: Observable<Upload[]> = this.uploadService.$queue;
  public $indexQueue: Observable<Index[]> = this.uploadService.$indexQueue;

  public $listCount: Observable<number> = combineLatest([this.$queue, this.$indexQueue]).pipe(map(([uploads, indices]) => (uploads.length + indices.length)));
  public $duplicateAmount: Observable<number> = this.$indexQueue.pipe(map((indices) => indices.filter((index) => index.status == IndexStatus.DUPLICATE).length));
  public $successAmount: Observable<number> = this.$indexQueue.pipe(map((indices) => indices.filter((index) => index.status == IndexStatus.OK).length));
  public $errorAmount: Observable<number> = this.$queue.pipe(map((uploads) => uploads.filter((u) => u.index?.status == IndexStatus.ERRORED).length));

  constructor(
    public uploadService: UploadService,
    public indexStatusService: IndexStatusService,
  ) {
    //this.$queue = this.uploadService.$queue;
    //this.$indexQueue = this.uploadService.$indexQueue;
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
