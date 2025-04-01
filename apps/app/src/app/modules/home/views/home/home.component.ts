import { Component, OnInit } from '@angular/core';

@Component({
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent implements OnInit {

  constructor(
  ) { }

  public greeting: string = "Guten Tag";

  public ngOnInit(): void {
    const currentDate = new Date();
    const currentHours = currentDate.getHours();

    console.log("hours: ", currentHours)

    if (currentHours >= 5 && currentHours < 11) {
      this.greeting = "Guten Morgen";
    } else if (currentDate.getHours() >= 11 && currentHours < 14) {
      this.greeting = "Guten Tag"
    } else if (currentDate.getHours() >= 14 && currentHours < 18) {
      this.greeting = "Schönen Nachmittag"
    } else {
      this.greeting = "Guten Abend"
    }
  }

}
