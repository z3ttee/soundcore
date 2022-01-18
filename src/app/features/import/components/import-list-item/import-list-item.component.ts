import { Component, Input, OnInit } from '@angular/core';
import { ImportEntity } from '../../entities/import.entity';

@Component({
  selector: 'asc-import-list-item',
  templateUrl: './import-list-item.component.html',
  styleUrls: ['./import-list-item.component.scss']
})
export class ImportListItemComponent implements OnInit {

  @Input() public import: ImportEntity;

  constructor() { }

  ngOnInit(): void {
  }

}
