import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SCNGXDialogService } from '../../services/dialog.service';

@Component({
  selector: 'scngx-dialog-section',
  templateUrl: './dialog-section.component.html',
  styleUrls: ['./dialog-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9) translate(-50%,-50%)' }),
        animate('140ms', style({ opacity: 1, transform: 'scale(1.0) translate(-50%,-50%)' })),
      ]),
      transition(':leave', [
        animate('80ms', style({ opacity: 0, transform: 'scale(0.9) translate(-50%,-50%)' })),
      ]),
    ])
  ]
})
export class SCNGXDialogSectionComponent implements OnInit, OnDestroy {

  @ViewChild('container', { read: ViewContainerRef }) public containerRef: ViewContainerRef;

  private readonly _destroy: Subject<void> = new Subject();

  constructor(
    private readonly service: SCNGXDialogService,
  ) { }

  public $current = this.service.$current.pipe(takeUntil(this._destroy));
  public $dialogs = this.service.$dialogs.pipe(takeUntil(this._destroy));

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
      // Tidy things up if the complete section
      // is destroyed.
      this.service.closeAll();
      this._destroy.next();
      this._destroy.complete();
  }

  public onBackdropClicked() {
    this.service.closeTop();
  }

}
