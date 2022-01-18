import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { filter, map, Observable, Subscription, tap } from 'rxjs';
import { MountStatus, StorageMount } from '../../model/storage-mount.model';
import { MountStatusService } from '../../services/mount-status.service';

@Component({
  selector: 'asc-mount-list-item',
  templateUrl: './mount-list-item.component.html',
  styleUrls: ['./mount-list-item.component.scss']
})
export class MountListItemComponent implements OnInit, OnDestroy {

  @Input() public mount: StorageMount;
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

  public async triggerEditEvent() {
    this.edit.emit()
  }

  public async triggerDeleteEvent() {
    this.delete.emit()
  }

}
