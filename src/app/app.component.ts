import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    // Check if user is logged in.

    // If not, redirect to login to:
    // https://account.tsalliance.eu/authorize?client_id=""&redirect_uri=""
  }
  title = 'alliance-soundcore';




}
