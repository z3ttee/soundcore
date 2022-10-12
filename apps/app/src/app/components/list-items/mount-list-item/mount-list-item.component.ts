import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { StatusIndicatorAppearance } from '@soundcore/ngx';
import { Mount, MountStatus } from "@soundcore/sdk";

@Component({
  selector: 'app-mount-list-item',
  templateUrl: './mount-list-item.component.html',
  styleUrls: ['./mount-list-item.component.scss'],
})
export class MountListItemComponent implements OnInit, OnChanges {

  @Input() public mount: Mount;
  public indicatorAppearance: StatusIndicatorAppearance;

  constructor() { }

  public ngOnInit(): void {
    this.init();
  }
  public ngOnChanges(changes: SimpleChanges): void {
    this.init();
  }

  private init() {
    if(this.mount.status == MountStatus.OK) {
      this.indicatorAppearance = "success";
      return;
    }

    if(this.mount.status == MountStatus.BUSY) {
      this.indicatorAppearance = "warn";
      return;
    }

    this.indicatorAppearance = "error";
  }

}
