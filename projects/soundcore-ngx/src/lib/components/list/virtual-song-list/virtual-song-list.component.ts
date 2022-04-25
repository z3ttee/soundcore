import {  Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Song } from 'soundcore-sdk';
import { DataSourceItem, SCNGXTrackListDataSource } from '../../../utils/datasource/datasource';
import { SCNGXSongColConfig } from '../song-list-item/song-list-item.component';
import { IPageInfo } from 'ngx-virtual-scroller';

@Component({
  selector: 'scngx-virtual-song-list',
  templateUrl: './virtual-song-list.component.html',
  styleUrls: ['./virtual-song-list.component.scss']
})
export class SCNGXVirtualSongListComponent implements OnInit, OnDestroy, OnChanges {

  @Input() public parentScroll?: HTMLElement;

  @Input() public dataSource: SCNGXTrackListDataSource;

  @Input() public usePadding: boolean = true;
  @Input() public columns: SCNGXSongColConfig = new SCNGXSongColConfig();

  private _onMoreSubject: Subject<IPageInfo> = new Subject();
  public $stream: Observable<DataSourceItem[]>;

  constructor() { }

  public ngOnInit(): void {
  }

  public ngOnChanges(changes: SimpleChanges): void {
      const prev = changes["dataSource"].previousValue as SCNGXTrackListDataSource;
      const current = changes["dataSource"].currentValue as SCNGXTrackListDataSource;

      if(!!prev) {
        prev.disconnect();
      }

      if(current) {
        this.$stream = current.connect(this._onMoreSubject.asObservable());
      }
  }

  public ngOnDestroy(): void {
    this._onMoreSubject.complete();
    this.dataSource.disconnect();
  }

  public emitOnContext() {

  }

  public fetchMore(event: IPageInfo) {
    this._onMoreSubject.next(event);
  }

  public entryTrackBy(index: number, complexItem: Song): string | number {
    return complexItem?.id || index;
  }

}
