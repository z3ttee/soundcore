import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-error404',
  templateUrl: './error404.component.html',
  styleUrls: ['./error404.component.scss']
})
export class Error404Component implements OnInit {

  @Input() public title: string = "Keine Ergebnisse gefunden";
  @Input() public message: string = "Bitte überprüfe, ob du einen gültigen Link besucht oder dich bei der Suche vertippt hast.";

  public options = {
    path: "assets/animated/error404.json",
    autoplay: true,
    loop: true
  }

  constructor() { }

  ngOnInit(): void {
  }

}
