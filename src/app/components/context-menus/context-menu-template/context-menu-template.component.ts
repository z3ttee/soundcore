import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import { Breakpoint, DeviceService } from 'src/app/services/device.service';

@Component({
  selector: 'asc-context-menu-template',
  templateUrl: './context-menu-template.component.html',
  styleUrls: ['./context-menu-template.component.scss']
})
export class AscContextMenuTemplateComponent implements OnInit, OnDestroy {

  @ViewChild("menuRef") public menuRef: TemplateRef<any>;

  constructor(
    private deviceService: DeviceService,
    private viewContainerRef: ViewContainerRef,
    private contextService: ContextMenuService
  ) { }

  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();
  
  public $breakpoint: Observable<Breakpoint> = this.deviceService.$breakpoint.pipe(takeUntil(this.$destroy));

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

  public async open(event: MouseEvent, contextData?: any) {
    event.stopPropagation();
    event.preventDefault();

    this.contextService.open(event, this.menuRef, this.viewContainerRef, contextData)
  }

  public async close() {
    this.contextService.close();
  }
}
