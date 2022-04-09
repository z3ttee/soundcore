import { Component } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { SCNGXScreenService } from 'soundcore-ngx';
import { AuthenticationService } from 'src/sso/services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
      public readonly screenService: SCNGXScreenService,
      public readonly authService: AuthenticationService,
      private readonly router: Router
  ) {}

  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public $isRouteLoading: Observable<boolean> = this._loadingSubject.asObservable();

  public ngOnInit(): void {
      this.router.events.pipe(filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError)).subscribe((event: NavigationStart | NavigationEnd) => {
          if(event instanceof NavigationStart) {
            this._loadingSubject.next(true);
          } else {
            this._loadingSubject.next(false);
          }
      })
  }

  public ngAfterViewInit(): void {
      const subscription = combineLatest([
          this.$isRouteLoading.pipe(takeUntil(this.$destroy), filter((isLoading) => !isLoading)),
          this.authService.$ready.pipe(takeUntil(this.$destroy), filter((isReady) => isReady))
      ]).pipe(map(([loading, ready]) => ({ loading, ready }))).subscribe((state) => {
          // TODO: this.playlistService.findByCurrentUser().subscribe();
          
          if(!state.loading && state.ready) {
            const splashElement = document.querySelector("#asc-splash-screen");
            splashElement.remove();
            subscription.unsubscribe();
          }
      })
  }

  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

}
