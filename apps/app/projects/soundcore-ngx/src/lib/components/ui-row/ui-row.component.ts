import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'scngx-ui-row',
  templateUrl: './ui-row.component.html',
  styleUrls: ['./ui-row.component.scss']
})
export class SCNGXUiRowComponent implements OnInit {

  @Input() public headline: string;
  @Input() public subtitle: string;
  @Input() public routeText: string = "Mehr anzeigen";
  @Input() public route: string | any[];

  constructor() { }

  ngOnInit(): void {
  }

}
