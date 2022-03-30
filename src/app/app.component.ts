import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { AuthenticationService } from 'src/sso/services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

  public showSplashScreen: boolean = true;

  private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public $isRouteLoading: Observable<boolean> = this._loadingSubject.asObservable();

  constructor(
    public authService: AuthenticationService, 
    private router: Router
  ) {
    this.router.events.pipe(filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError)).subscribe((event: NavigationStart | NavigationEnd) => {
      if(event instanceof NavigationStart) {
        this._loadingSubject.next(true);
      } else {
        this._loadingSubject.next(false);
      }
    })
  }




}
