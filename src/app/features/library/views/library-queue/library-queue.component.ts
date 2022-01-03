import { Component, OnInit } from '@angular/core';
import { filter, map, Observable } from 'rxjs';
import { Upload } from '../../entities/upload.entity';
import { LibraryService } from '../../services/library.service';
import { io, Socket } from "socket.io-client"
import { environment } from 'src/environments/environment';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UploadedAudioFile } from '../../entities/uploaded-file.entity';
import { FileStatus } from '../../enums/file-status.enum';
import { Index } from '../../entities/index.entity';
import { UploadService } from '../../services/upload.service';

export const INDEX_STATUS_EVENT = "onIndexStatusUpdate"

@Component({
  selector: 'asc-library-queue',
  templateUrl: './library-queue.component.html',
  styleUrls: ['./library-queue.component.scss']
})
export class LibraryQueueComponent implements OnInit {

  public $queue: Observable<Upload[]>

  /*public $successQueue: Observable<Upload[]>
  public $activeQueue: Observable<Upload[]>
  public $erroredQueue: Observable<Upload[]>
  public $duplicatesQueue: Observable<Upload[]>*/

  public socket: Socket;

  constructor(private libraryService: LibraryService, public uploadService: UploadService, private authService: AuthenticationService) {
    this.$queue = this.uploadService.$queue;

    this.uploadService.$queue.subscribe((queue) => {
      console.log("queue updated", queue)
    })

    /*this.$successQueue = this.$queue.pipe(map((uploads) => uploads.filter((upload) => upload.status == FileStatus.STATUS_AVAILABLE || upload.status == FileStatus.STATUS_LOOKUP_LYRICS)))
    this.$activeQueue = this.$queue.pipe(map((uploads) => uploads.filter((upload) => upload.status == FileStatus.STATUS_UPLOADING || upload.status == FileStatus.STATUS_AWAIT_UPLOAD || upload.status == FileStatus.STATUS_PROCESSING)))
    this.$erroredQueue = this.$queue.pipe(map((uploads) => uploads.filter((upload) => upload.status == FileStatus.STATUS_ERRORED || upload.status == FileStatus.STATUS_CORRUPTED || upload.status == FileStatus.STATUS_UNAVAILABLE)))
    this.$duplicatesQueue = this.$queue.pipe(map((uploads) => uploads.filter((upload) => upload.status == FileStatus.STATUS_DUPLICATE)))*/

    /*this.socket = io(`${environment.api_base_uri}/index-status/`, {
      extraHeaders: {
        "Authorization": "Bearer " + this.authService.getAccessToken()
      }
    })*/
  }

  ngOnInit(): void {
    // TODO: Fetch processing files from api.
    // TODO: Subscribe to a queue or maybe interval?

    // this.socket.on(INDEX_STATUS_EVENT, (data: Index) => this.onStatusUpdate(data))
  }

  public async enqueueFiles(event: Event) {
    const files: FileList = event.target["files"];

    event.target["files"] = null
    for(let i = 0; i < files.length; i++) {
      this.uploadService.enqueueFile(files.item(i))
    }
  }

  public async onStatusUpdate(index: Index) {
    this.uploadService.updateIndex(index)
  }

}
