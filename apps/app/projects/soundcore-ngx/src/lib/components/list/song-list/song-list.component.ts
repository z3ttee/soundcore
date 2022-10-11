import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { IPageInfo } from '@tsalliance/ngx-virtual-scroller';
import { Observable, Subject } from 'rxjs';
import { PlaylistItem, Song } from 'soundcore-sdk';
import { DatasourceItem } from '../../../utils/datasource/datasource';
import { BaseTracklistDatasource, SCNGXTracklistDatasource } from '../../../utils/datasource/tracklist-datasource';
import { SCNGXSongColConfig } from '../song-list-item/song-list-item.component';

@Component({
  selector: 'scngx-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.scss']
})
export class SCNGXSongListComponent implements OnInit {

  @Input() public dataSource: BaseTracklistDatasource<any>;
  @Input() public usePadding: boolean = true;
  @Input() public columns: SCNGXSongColConfig = new SCNGXSongColConfig();
  
  public $stream: Observable<DatasourceItem<PlaylistItem | Song>[]>;
  private _onMoreSubject: Subject<IPageInfo> = new Subject();

  constructor() { }

  ngOnInit(): void {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const prev = changes["dataSource"].previousValue as SCNGXTracklistDatasource;
    const current = changes["dataSource"].currentValue as SCNGXTracklistDatasource;

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

public entryTrackBy(index: number, complexItem: DatasourceItem<Song>) {
  return complexItem?.data?.id || index;
}

  public emitOnContext() {
    
  }

}
