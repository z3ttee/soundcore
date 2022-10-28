import { AfterViewInit, Component, Injector, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogRef } from '../../entities/dialog-ref.entity';
import { Dialog } from '../../entities/dialog.entity';

@Component({
  selector: 'scngx-dialog-container',
  templateUrl: './dialog-container.component.html',
  styleUrls: ['./dialog-container.component.scss']
})
export class DialogContainerComponent implements OnInit, AfterViewInit {

  @Input() public dialog: Dialog;
  @ViewChild('container', { read: ViewContainerRef }) public containerRef: ViewContainerRef;

  constructor(
    private readonly injector: Injector,
  ) { }

  public ngOnInit(): void {}
  public ngAfterViewInit(): void {
    if(!this.containerRef) return;

    const componentRef = this.containerRef.createComponent(this.dialog.component, {
      injector: Injector.create({ parent: this.injector, providers: [
          {
            provide: DialogRef,
            useValue: this.dialog.ref
          }
        ]
      }),
    });

    this.dialog.setComponentRef(componentRef);
    componentRef.changeDetectorRef.detectChanges();
  }

  public dismiss(result?: any) {
    this.dialog.ref.close(result);
  }

}
