import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { IPageInfo } from '@tsalliance/ngx-virtual-scroller';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { PlaylistItem } from '@soundcore/sdk';
import { DatasourceItem, SCNGX_DATASOURCE_PAGE_SIZE } from '../../../utils/datasource/datasource';
import { SCNGXPlaylistDatasource } from '../../../utils/datasource/playlist-datasource';
import { SCNGXSongColConfig } from '../song-list-item/song-list-item.component';

@Component({
  selector: 'scngx-virtual-playlist',
  templateUrl: './virtual-playlist.component.html',
  styleUrls: ['./virtual-playlist.component.scss']
})
export class SCNGXVirtualPlaylistComponent implements OnInit {

  /**
   * Define parent element for virtual scrolling.
   * If no parent is provided, the height of the wrapping element
   * must be set somehow as the list takes up 100% of height and width.
   */
  @Input() public parentScroll?: HTMLElement;

  /**
   * Define columns definition.
   */
  @Input() public columns: SCNGXSongColConfig = new SCNGXSongColConfig();

  /**
   * Input property to control wether to show
   * or hide skeleton items. Used to create
   * loading effects in the ui.
   */
  @Input() public showSkeleton: boolean = false;

  /**
   * Input property to control the amount of skeleton items
   * to be shown, if the prop showSkeleton is set to true.
   */
  @Input() public skeletons: number = SCNGX_DATASOURCE_PAGE_SIZE;

  @Input() public datasource: SCNGXPlaylistDatasource;
  public skeletonItems: any[] = new Array(this.skeletons || 0);

  private readonly _onMoreSubject: Subject<IPageInfo> = new Subject();
  private readonly _heightSubject: BehaviorSubject<number> = new BehaviorSubject(0);

  /**
   * Observable that emits the maximum possible height of the list.
   * Only emits useable values if useMaxHeight is allowed and
   * a propery itemHeight was provided or calculated.
   */
  public readonly $maxHeight: Observable<number> = this._heightSubject.asObservable();

  public $datasource: Observable<DatasourceItem<PlaylistItem>[]>;

  constructor() { }

  public ngOnInit(): void {}

  public ngOnDestroy(): void {
    this._onMoreSubject.complete();
  }

  public ngOnChanges(changes: SimpleChanges): void {
      const prev = changes["datasource"]?.previousValue as SCNGXPlaylistDatasource;
      const current = changes["datasource"]?.currentValue as SCNGXPlaylistDatasource;

      console.log(prev, current);

      // Set skeleton items
      if(this.showSkeleton) {
        this.skeletonItems = new Array(this.skeletons || 0);
        this.$datasource = of(this.skeletonItems)
      }

      if(!!prev) {
        prev.disconnect();
      }

      if(current) {
        this.$datasource = current.connect(this._onMoreSubject.asObservable());
      }
  }

  public entryTrackBy(index: number, complexItem: DatasourceItem<PlaylistItem>) {
    return complexItem?.data?.id || index;
  }

  public fetchMore(event: IPageInfo) {
    this._onMoreSubject.next(event);
  }

}
