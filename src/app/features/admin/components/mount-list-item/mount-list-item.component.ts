import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StorageMount } from '../../model/storage-mount.model';

@Component({
  selector: 'asc-mount-list-item',
  templateUrl: './mount-list-item.component.html',
  styleUrls: ['./mount-list-item.component.scss']
})
export class MountListItemComponent implements OnInit {

  @Input() public mount: StorageMount;
  @Output() public edit: EventEmitter<void> = new EventEmitter();
  @Output() public delete: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  public async triggerEditEvent() {
    this.edit.emit()
  }

  public async triggerDeleteEvent() {
    this.delete.emit()
  }

}
