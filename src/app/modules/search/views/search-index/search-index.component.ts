import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SCNGXScreenService } from 'soundcore-ngx';
import { SCDKSearchService } from 'soundcore-sdk';

@Component({
  selector: 'app-search-index',
  templateUrl: './search-index.component.html',
  styleUrls: ['./search-index.component.scss']
})
export class SearchIndexComponent implements OnInit {

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly searchService: SCDKSearchService,
    public readonly screenService: SCNGXScreenService
  ) { }


  public ngOnInit(): void {
   
  }

  public async performComplexSearch(query: string) {
    
  }

}
