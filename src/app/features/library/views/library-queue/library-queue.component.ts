import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Upload } from '../../entities/upload.entity';
import { LibraryService } from '../../services/library.service';

@Component({
  selector: 'asc-library-queue',
  templateUrl: './library-queue.component.html',
  styleUrls: ['./library-queue.component.scss']
})
export class LibraryQueueComponent implements OnInit {

  public $queue: Observable<Upload[]>

  constructor(private libraryService: LibraryService) {
    this.$queue = this.libraryService.$queue;
  }

  ngOnInit(): void {
    // TODO: Fetch processing files from api.
    // TODO: Subscribe to a queue or maybe interval?
  }

  public async enqueueFiles(event: Event) {
    const files: FileList = event.target["files"];

    event.target["files"] = null
    for(let i = 0; i < files.length; i++) {
      this.libraryService.enqueueFile(files.item(i))
    }
  }

  public async onFilesDrag(event: Event) {
    console.log(event)
  }

}
