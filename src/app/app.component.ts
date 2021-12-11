import { Component } from '@angular/core';
import { SPLASH_SESSIONSTORAGE } from './constants';
import { AuthenticationService } from './services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public showSplashScreen: boolean = true;

  constructor(public authService: AuthenticationService) {
    this.showSplashScreen = sessionStorage.getItem(SPLASH_SESSIONSTORAGE) === "true" || true;
    sessionStorage.setItem(SPLASH_SESSIONSTORAGE, `${this.showSplashScreen}`);

    this.authService.$isLoggedIn.subscribe((isLoggedIn) => this.showSplashScreen = !isLoggedIn)
  }


}
