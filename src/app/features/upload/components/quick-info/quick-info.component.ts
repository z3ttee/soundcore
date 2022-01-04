import { Component, Input, OnInit } from '@angular/core';
import { UploadQuickInfo } from '../../entities/quick-info.entity';

@Component({
  selector: 'asc-quick-info',
  templateUrl: './quick-info.component.html',
  styleUrls: ['./quick-info.component.scss']
})
export class QuickInfoComponent implements OnInit {

  @Input() public info: UploadQuickInfo;

  constructor() { }

  ngOnInit(): void {
  }

}
