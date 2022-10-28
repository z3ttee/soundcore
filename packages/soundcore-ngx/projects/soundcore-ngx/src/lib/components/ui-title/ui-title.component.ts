import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'scngx-ui-title',
  templateUrl: './ui-title.component.html',
  styleUrls: ['./ui-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXUiTitleComponent implements OnInit, OnDestroy {

  public readonly $subtitle: BehaviorSubject<string> = new BehaviorSubject(null);

  @Input() public set subtitle(val: string) {
    this.$subtitle.next(val);
  }

  constructor() { }

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
      this.$subtitle.complete();
  }

}
