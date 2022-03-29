import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Index } from 'src/app/features/upload/entities/index.entity';
import { IndexStatus } from 'src/app/features/upload/enums/index-status.enum';
import { IndexService } from '../../services/index.service';

@Component({
  selector: 'asc-index-list-item',
  templateUrl: './index-list-item.component.html',
  styleUrls: ['./index-list-item.component.scss']
})
export class IndexListItemComponent implements OnInit, OnDestroy {

  @Input() public index: Index;
  @Output() public delete: EventEmitter<void> = new EventEmitter();
  @Output() public reindex: EventEmitter<void> = new EventEmitter();


  constructor(private indexService: IndexService) { }

  public status: IndexStatus = IndexStatus.OK;
  private _statusSub: Subscription = null;

  ngOnInit(): void {
    this.status = this.index.status;
  }

  ngOnDestroy(): void {
    if(this._statusSub) this._statusSub.unsubscribe();
  }

  public async triggerDeleteEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.delete.emit()
  }

  public async triggerReindex(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.reindex.emit()
  }

}
