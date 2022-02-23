import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Mount, MountStatus } from '../../entities/mount.entity';
import { MountStatusService } from '../../services/mount-status.service';

@Component({
  selector: 'asc-mount-list-item',
  templateUrl: './mount-list-item.component.html',
  styleUrls: ['./mount-list-item.component.scss']
})
export class MountListItemComponent implements OnInit, OnDestroy {

  @Input() public mount: Mount;
  @Output() public edit: EventEmitter<void> = new EventEmitter();
  @Output() public delete: EventEmitter<void> = new EventEmitter();

  constructor(private mountStatusService: MountStatusService) { }

  public status: MountStatus = "ok";
  private _statusSub: Subscription = null;

  ngOnInit(): void {
    this.status = this.mount.status;
    this._statusSub = this.mountStatusService.$updates.subscribe((mount) => {
      if(this.mount.id == mount?.id) {
        this.status = mount.status;
      }
    });
  }

  ngOnDestroy(): void {
    if(this._statusSub) this._statusSub.unsubscribe();
  }

  public async triggerEditEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.edit.emit()
  }

  public async triggerDeleteEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.delete.emit()
  }

}
