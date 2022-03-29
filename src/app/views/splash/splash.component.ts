import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'asc-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {

  public errorMessage: string;

  constructor() { }

  public ngOnInit(): void {
  }

}
