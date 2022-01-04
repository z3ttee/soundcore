import { Component, Input, OnInit } from '@angular/core';
import { Index } from '../../entities/index.entity';
import { IndexStatus } from '../../enums/index-status.enum';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'asc-index-list-item',
  templateUrl: './index-list-item.component.html',
  styleUrls: ['./index-list-item.component.scss']
})
export class IndexListItemComponent implements OnInit {

  @Input() public index: Index;

  public showProgress: boolean = true;
  public isSuccess: boolean = false;

  constructor(private uploadService: UploadService){}

  ngOnInit(): void {
    console.log("new upload item")

    this.showProgress = this.index.status != IndexStatus.OK && this.index.status != IndexStatus.ERRORED && this.index.status != IndexStatus.DUPLICATE
    this.isSuccess = this.index.status == IndexStatus.OK;
  }

  public clearIndexFromList() {
    this.uploadService.clearIndex(this.index.id);
  }

}
