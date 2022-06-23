import {  Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { SCNGXSongColConfig } from '../song-list-item/song-list-item.component';
import { IPageInfo } from '@tsalliance/ngx-virtual-scroller';
import { SCNGXTrackListDataSourceV2, SCNGX_DATASOURCE_PAGE_SIZE, TrackDataSourceItem } from '../../../utils/datasource/datasourcev2';

@Component({
  selector: 'scngx-virtual-song-list',
  templateUrl: './virtual-song-list.component.html',
  styleUrls: ['./virtual-song-list.component.scss']
})
export class SCNGXVirtualSongListComponent implements OnInit, OnDestroy, OnChanges {

  /**
   * Define parent element for virtual scrolling.
   * If no parent is provided, the height of the wrapping element
   * must be set somehow as the list takes up 100% of height and width.
   */
  @Input() public parentScroll?: HTMLElement;

  /**
   * Datasource to be used
   */
  @Input() public dataSource: SCNGXTrackListDataSourceV2;
  @Input() public usePadding: boolean = true;

  /**
   * Define columns definition.
   */
  @Input() public columns: SCNGXSongColConfig = new SCNGXSongColConfig();

  /**
   * Enable precalculation of lists height.
   * This requires all items to be the same height.
   * If itemHeight is not set, the first child will be taken
   * into account for calculation.
   */
  @Input() public useMaxHeight: boolean = false;

  /**
   * Define the calculated item height, so the height of the list
   * can be precalculated.
   */
  @Input() public itemHeight: number = 0;

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
  
  public skeletonItems: any[] = new Array(this.skeletons || 0);
  private readonly _onMoreSubject: Subject<IPageInfo> = new Subject();
  private readonly _streamSubject: BehaviorSubject<Observable<TrackDataSourceItem[]>> = new BehaviorSubject(of([]));
  private readonly _heightSubject: BehaviorSubject<number> = new BehaviorSubject(0);

  /**
   * Stream observable that emits the current dataStream
   * (Yes its messy I know, will be subject to change)
   */
  public readonly $streamObs: Observable<Observable<TrackDataSourceItem[]>> = this._streamSubject.asObservable();

  /**
   * Observable that emits the maximum possible height of the list.
   * Only emits useable values if useMaxHeight is allowed and
   * a propery itemHeight was provided or calculated.
   */
  public readonly $maxHeight: Observable<number> = this._heightSubject.asObservable();


  constructor(
    private readonly elementRef: ElementRef<HTMLDivElement>
  ) { }

  public ngOnInit(): void {}

  public ngOnChanges(changes: SimpleChanges): void {
      const prev = changes["dataSource"]?.previousValue as SCNGXTrackListDataSourceV2;
      const current = changes["dataSource"]?.currentValue as SCNGXTrackListDataSourceV2;

      // Set skeleton items
      if(this.showSkeleton) {
        this.skeletonItems = new Array(this.skeletons || 0);
        this._streamSubject.next(of(this.skeletonItems))
      }

      // Update container height
      if(this.useMaxHeight) {
        const container = this.elementRef.nativeElement.children[0];
        const height = (this.itemHeight || 56) * (this.dataSource?.totalElements || this.skeletons)
        container["style"]["height"] = `${height}px`;
      }

      if(!!prev) {
        prev.disconnect();
      }

      if(current) {
        this._streamSubject.next(current.connect(this._onMoreSubject.asObservable()));
      }
  }

  public ngOnDestroy(): void {
    this._onMoreSubject.complete();
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
