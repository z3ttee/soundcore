import { Component, OnInit } from '@angular/core';
import { DeviceService } from 'src/app/services/device.service';

@Component({
  selector: 'asc-interface-list-item-template',
  templateUrl: './interface-list-item-template.component.html',
  styleUrls: ['./interface-list-item-template.component.scss']
})
export class AscInterfaceListItemTemplateComponent implements OnInit {

  constructor(
    public deviceService: DeviceService
  ) { }

  public ngOnInit(): void {}

}
