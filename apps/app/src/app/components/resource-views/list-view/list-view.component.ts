import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SCCDKScreenService } from '@soundcore/cdk';
import { Artwork, SCDKResource } from "@soundcore/sdk";

const DEFAULT_ACCENT_COLOR = "#cccccc";

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss']
})
export class ListViewComponent implements OnInit, OnDestroy, OnChanges {

  constructor(
    public readonly screenService: SCCDKScreenService
  ) { }

  @Input() public title: string;
  @Input() public artwork: Artwork;
  @Input() public isLoading: boolean = false;
  @Input() public resource: SCDKResource;

  public accentColor: string = DEFAULT_ACCENT_COLOR;

  private $destroy: Subject<void> = new Subject();
  public $isTouch: Observable<boolean> = this.screenService.$isTouch.pipe(takeUntil(this.$destroy));

  public ngOnInit(): void {}
  public ngOnChanges(changes: SimpleChanges): void {
      const current: SCDKResource = changes["resource"]?.currentValue;
      this.accentColor = current?.artwork?.colors?.vibrant || DEFAULT_ACCENT_COLOR;
  }
  public ngOnDestroy(): void {
      this.$destroy.complete();
      this.$destroy.next();
  }

}
