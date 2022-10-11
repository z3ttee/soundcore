import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'sccdk-context-menu-category',
  templateUrl: './context-menu-category.component.html',
  styleUrls: ['./context-menu-category.component.scss']
})
export class SCCDKContextMenuCategoryComponent implements OnInit {

  @Input() public label: string;

  constructor() { }
  public ngOnInit(): void {}

}
