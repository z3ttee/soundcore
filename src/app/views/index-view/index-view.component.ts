import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './index-view.component.html',
  styleUrls: ['./index-view.component.scss']
})
export class IndexViewComponent implements OnInit {

  constructor(
    // public keycloakService: KeycloakService
  ) { }

  ngOnInit(): void {
    /*this.keycloakService.keycloakEvents$.subscribe((event) => {
      console.log(event)
    })*/
  }

}
