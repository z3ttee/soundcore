import { Component, OnInit } from '@angular/core';
import { SCNGXScreenService } from 'soundcore-ngx';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private readonly screenService: SCNGXScreenService

  ) { }

  ngOnInit(): void {
  }

}
