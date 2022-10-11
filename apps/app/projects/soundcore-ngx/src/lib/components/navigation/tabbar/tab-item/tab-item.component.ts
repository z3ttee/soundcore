import { Component, Input, OnInit } from '@angular/core';
import { SCCDKScreenService } from 'soundcore-cdk';

export interface SCNGXTabItemRoute {
  commands: any[];
  exact?: boolean;
}

@Component({
  selector: 'scngx-tab-item',
  templateUrl: './tab-item.component.html',
  styleUrls: ['./tab-item.component.scss']
})
export class SCNGXTabItemComponent implements OnInit {

  @Input() public route: SCNGXTabItemRoute;

  constructor(
    public readonly screenService: SCCDKScreenService
  ) { }

  ngOnInit(): void {
    
  }

}
