import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { File, FileFlag } from 'soundcore-sdk';
import { StatusIndicatorAppearance } from "soundcore-ngx";

@Component({
  selector: 'app-file-list-item',
  templateUrl: './file-list-item.component.html',
  styleUrls: ['./file-list-item.component.scss']
})
export class FileListItemComponent implements OnInit, OnChanges {

  @Input() public file: File;

  public indicatorAppearance: StatusIndicatorAppearance;

  constructor() { }

  public ngOnInit(): void {
    this.init();
  }
  public ngOnChanges(changes: SimpleChanges): void {
    this.init();
  }

  private init() {
    if(this.file.flag == FileFlag.OK) {
      this.indicatorAppearance = "success";
      return;
    }
    if(this.file.flag == FileFlag.DUPLICATE || this.file.flag == FileFlag.PROCESSING) {
      this.indicatorAppearance = "warn";
      return;
    }
    if(this.file.flag == FileFlag.DELETED || this.file.flag == FileFlag.CORRUPT || this.file.flag == FileFlag.FAILED_SONG_CREATION) {
      this.indicatorAppearance = "error";
      return;
    }

    this.indicatorAppearance = "none";
  }

}
