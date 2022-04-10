import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-error404',
  templateUrl: './error404.component.html',
  styleUrls: ['./error404.component.scss']
})
export class Error404Component implements OnInit {

  public options = {
    path: "assets/animated/error404.json",
    autoplay: true,
    loop: true
  }

  constructor() { }

  ngOnInit(): void {
  }

}
