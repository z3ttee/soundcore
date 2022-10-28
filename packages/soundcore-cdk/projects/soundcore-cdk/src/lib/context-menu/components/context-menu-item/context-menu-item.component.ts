import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { SCCDKContextService } from '../../services/context-menu.service';

@Component({
  selector: 'sccdk-context-menu-item',
  templateUrl: './context-menu-item.component.html',
  styleUrls: ['./context-menu-item.component.scss']
})
export class SCCDKContextMenuItemComponent implements OnInit, OnDestroy {
  private readonly _destroy: Subject<void> = new Subject();

  @Output() public selected: EventEmitter<PointerEvent> = new EventEmitter();

  constructor(
    private readonly elementRef: ElementRef,
    private readonly service: SCCDKContextService
  ) { }

  public ngOnInit(): void {
    fromEvent(this.elementRef.nativeElement, "click").pipe(takeUntil(this._destroy)).subscribe((event: PointerEvent) => {
      this.service.close();

      event.preventDefault();
      event.stopImmediatePropagation();

      this.selected.emit(event);
    })
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

}
