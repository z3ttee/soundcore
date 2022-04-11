import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SCNGXScreenService } from 'soundcore-ngx';

@Component({
  selector: 'app-search-index',
  templateUrl: './search-index.component.html',
  styleUrls: ['./search-index.component.scss']
})
export class SearchIndexComponent implements OnInit {

  constructor(
    public readonly screenService: SCNGXScreenService,
    private readonly _location: Location
  ) { }

  public ngOnInit(): void {}

}
