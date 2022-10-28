import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Song } from '@soundcore/sdk';

@Component({
  selector: 'app-player-bar',
  templateUrl: './player-bar.component.html',
  styleUrls: ['./player-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerBarComponent implements OnInit, OnDestroy {

  public song: Song;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>
  ) { }

  private _observer: ResizeObserver;

  public readonly $showMaximize: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public readonly $showHistoryControls: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public readonly $showDuration: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public readonly $reducedMode: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public ngOnInit(): void {
    this._observer = new ResizeObserver((entries: ResizeObserverEntry[], observer: ResizeObserver) => {
      const width = this.elementRef.nativeElement.getBoundingClientRect().width;

      this.$showMaximize.next(width > 650);
      this.$showHistoryControls.next(width > 770);
      this.$showDuration.next(width > 650);
      this.$reducedMode.next(width < 600);
    })

    this._observer.observe(this.elementRef.nativeElement);
  }

  public ngOnDestroy(): void {
      this._observer.disconnect();
  }

}
