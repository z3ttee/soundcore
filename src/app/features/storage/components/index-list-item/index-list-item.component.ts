import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Index } from 'src/app/features/upload/entities/index.entity';
import { IndexStatus } from 'src/app/features/upload/enums/index-status.enum';
import { Mount, MountStatus } from '../../entities/mount.entity';
import { IndexService } from '../../services/index.service';
import { MountStatusService } from '../../services/mount-status.service';

@Component({
  selector: 'asc-index-list-item',
  templateUrl: './index-list-item.component.html',
  styleUrls: ['./index-list-item.component.scss']
})
export class IndexListItemComponent implements OnInit, OnDestroy {

  @Input() public index: Index;
  @Output() public delete: EventEmitter<void> = new EventEmitter();

  constructor(private indexService: IndexService) { }

  public status: IndexStatus = IndexStatus.OK;
  private _statusSub: Subscription = null;

  ngOnInit(): void {
    this.status = this.index.status;
    /*this._statusSub = this.indexService.$updates.subscribe((mount) => {
      if(this.mount.id == mount?.id) {
        this.status = mount.status;
      }
    });*/
  }

  ngOnDestroy(): void {
    if(this._statusSub) this._statusSub.unsubscribe();
  }

  public async triggerEditEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    // this.edit.emit()
  }

  public async triggerDeleteEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.delete.emit()
  }

}
