import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { IPageInfo } from 'ngx-virtual-scroller';
import { Observable, of, Subject } from 'rxjs';
import { Song } from 'soundcore-sdk';
import { SCNGXTrackListDataSourceV2, TrackDataSourceItem } from '../../../utils/datasource/datasourcev2';
import { SCNGXSongColConfig } from '../song-list-item/song-list-item.component';

@Component({
  selector: 'scngx-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss']
})
export class SCNGXSongListComponent implements OnInit {

  @Input() public dataSource: SCNGXTrackListDataSourceV2;
  @Input() public usePadding: boolean = true;
  @Input() public columns: SCNGXSongColConfig = new SCNGXSongColConfig();
  
  public $stream: Observable<TrackDataSourceItem[]>;
  private _onMoreSubject: Subject<IPageInfo> = new Subject();

  constructor() { }

  ngOnInit(): void {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const prev = changes["dataSource"].previousValue as SCNGXTrackListDataSourceV2;
    const current = changes["dataSource"].currentValue as SCNGXTrackListDataSourceV2;

    if(!!prev) {
      prev.disconnect();
    }

    if(current) {
      this.$stream = current.connect(this._onMoreSubject.asObservable());
    }
}

public ngOnDestroy(): void {
  // TODO: Check if is enqueued
  this.dataSource.disconnect();
}

public entryTrackBy(index: number, complexItem: TrackDataSourceItem) {
  return complexItem?.data?.id || index;
}

  public emitOnContext() {
    
  }

}
