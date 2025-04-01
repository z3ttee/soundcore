import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { StatusIndicatorAppearance } from "@repo/angular-ui";
import { File, FileFlag } from '@repo/angular-sdk';

@Component({
    selector: 'app-file-list-item',
    templateUrl: './file-list-item.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
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
    if (this.file.flag == FileFlag.OK) {
      this.indicatorAppearance = "success";
      return;
    }
    if (this.file.flag == FileFlag.POTENTIAL_DUPLICATE || this.file.flag == FileFlag.PENDING_ANALYSIS) {
      this.indicatorAppearance = "warn";
      return;
    }
    if (this.file.flag == FileFlag.ERROR) {
      this.indicatorAppearance = "error";
      return;
    }

    this.indicatorAppearance = "none";
  }

}
