import { Component } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { SPLASH_SESSIONSTORAGE } from './constants';
import { AuthenticationService } from './sso/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public showSplashScreen: boolean = true;
  public showLoadingBar: boolean = false;

  constructor(public authService: AuthenticationService, private router: Router) {
    this.showSplashScreen = sessionStorage.getItem(SPLASH_SESSIONSTORAGE) === "true" || true;
    sessionStorage.setItem(SPLASH_SESSIONSTORAGE, `${this.showSplashScreen}`);

    this.authService.$isLoggedIn.subscribe((isLoggedIn) => this.showSplashScreen = !isLoggedIn)

    this.router.events.pipe(filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError)).subscribe((event: NavigationStart | NavigationEnd) => {
      if(event instanceof NavigationStart) {
        this.showLoadingBar = true;
      } else {
        this.showLoadingBar = false;
      }
    })
  }




}
