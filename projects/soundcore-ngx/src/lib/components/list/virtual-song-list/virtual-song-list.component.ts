import {  Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Song } from 'soundcore-sdk';
import { SCNGXSongColConfig } from '../song-list-item/song-list-item.component';
import { IPageInfo } from 'ngx-virtual-scroller';
import { SCNGXTrackListDataSourceV2, TrackDataSourceItem } from '../../../utils/datasource/datasourcev2';

@Component({
  selector: 'scngx-virtual-song-list',
  templateUrl: './virtual-song-list.component.html',
  styleUrls: ['./virtual-song-list.component.scss']
})
export class SCNGXVirtualSongListComponent implements OnInit, OnDestroy, OnChanges {

  @Input() public parentScroll?: HTMLElement;

  @Input() public dataSource: SCNGXTrackListDataSourceV2;
  @Input() public usePadding: boolean = true;
  @Input() public columns: SCNGXSongColConfig = new SCNGXSongColConfig();

  private _onMoreSubject: Subject<IPageInfo> = new Subject();
  public $stream: Observable<TrackDataSourceItem[]>;

  constructor() { }

  public ngOnInit(): void {
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
    this._onMoreSubject.complete();

    // TODO: Check if is enqueued
    this.dataSource.disconnect();
  }

  public emitOnContext() {
    // TODO
  }

  public fetchMore(event: IPageInfo) {
    this._onMoreSubject.next(event);
  }

  public entryTrackBy(index: number, complexItem: TrackDataSourceItem) {
    return complexItem?.data?.id || index;
  }

}
