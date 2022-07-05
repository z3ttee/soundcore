import { AfterViewInit, ChangeDetectionStrategy, Component, ComponentRef, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SCNGXDialogService } from '../../services/dialog.service';

@Component({
  selector: 'scngx-dialog-section',
  templateUrl: './dialog-section.component.html',
  styleUrls: ['./dialog-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXDialogSectionComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild("dialogSection") public dialogSectionRef: ElementRef<HTMLDivElement>;
  @ViewChild('container', { read: ViewContainerRef }) public containerRef: ViewContainerRef;

  private readonly _destroy: Subject<void> = new Subject();

  constructor(
    private readonly service: SCNGXDialogService,
    private readonly viewContainerRef: ViewContainerRef
  ) { }

  public $current = this.service.$current.pipe(takeUntil(this._destroy));

  private componentRef: ComponentRef<any>;

  public ngOnInit(): void {}
  public ngAfterViewInit(): void {
      this.$current.subscribe((dialog) => {
        if(typeof dialog == "undefined" || dialog == null) return
        if(!dialog.instantiated) {
          dialog.setComponentRef(this.containerRef.createComponent(dialog.ref.component));
        } else {
          this.containerRef.insert(dialog.viewRef);
        }
      })
  }
  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public onBackdropClicked() {
    this.service.closeTop();
  }

}
