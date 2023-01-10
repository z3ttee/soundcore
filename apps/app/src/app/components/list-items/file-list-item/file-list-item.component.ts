import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { File, FileFlag } from '@soundcore/sdk';
import { StatusIndicatorAppearance } from "@soundcore/ngx";

@Component({
  selector: 'app-file-list-item',
  templateUrl: './file-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXFileListItemComponent implements OnInit, OnChanges {

  @Input() 
  public file: File;

  @Input()
  public itemHeight: number = 56;

  public indicatorAppearance: StatusIndicatorAppearance;

  constructor() { }

  public ngOnInit(): void {
    // this.init();
  }
  public ngOnChanges(changes: SimpleChanges): void {
    // this.init();
  }

  private init() {
    if(this.file.flag == FileFlag.OK) {
      this.indicatorAppearance = "success";
      return;
    }
    if(this.file.flag == FileFlag.POTENTIAL_DUPLICATE || this.file.flag == FileFlag.PENDING_ANALYSIS) {
      this.indicatorAppearance = "warn";
      return;
    }
    if(this.file.flag == FileFlag.ERROR) {
      this.indicatorAppearance = "error";
      return;
    }

    this.indicatorAppearance = "none";
  }

}
