import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { SSOService } from '@soundcore/sso';
import { BehaviorSubject, combineLatest, filter, map, Observable, startWith, Subject, takeUntil, tap } from 'rxjs';
import { SCCDKScreenService } from '@soundcore/cdk';
import { SCSDKAppService } from '@soundcore/sdk';
import { environment } from 'src/environments/environment';

interface AppProps {
  ready?: boolean;
  keycloakInitError?: Error;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(
      public readonly screenService: SCCDKScreenService,
      public readonly authService: SSOService,
      private readonly router: Router,
      private readonly appService: SCSDKAppService
  ) {}

  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public $isRouteLoading: Observable<boolean> = this._loadingSubject.asObservable();

  public readonly $props: Observable<AppProps> = combineLatest([
    this.$isRouteLoading.pipe(filter((isLoading) => !isLoading)),
    this.authService.$ready.pipe(filter((isReady) => isReady)),
    this.authService.$onInitError.pipe(startWith(null)),
    this.appService.$appInfo,
  ]).pipe(
    map(([isRouteLoading, isReady, keycloakInitError, appInfo]): AppProps => {
      console.log(`Successfully contacted backend application on '${environment.api_base_uri}/v1'. Version: ${appInfo?.build?.version}, Application mode: ${appInfo?.isDockerized ? 'Docker' : 'Standalone'}`)
      
      // Toggle splash element
      const splashElement: HTMLElement = document.querySelector("#asc-splash-screen");
      if(!isRouteLoading && isReady) {
        splashElement.style.display = "none";
      } else {
        splashElement.style.display = "block";
      }

      return {
        ready: !isRouteLoading && isReady,
        keycloakInitError: keycloakInitError
      }
    }),
    takeUntil(this.$destroy)
  );

  public ngOnInit(): void {
      this.router.events.pipe(filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError)).subscribe((event: NavigationStart | NavigationEnd) => {
          if(event instanceof NavigationStart) {
            this._loadingSubject.next(true);
          } else {
            this._loadingSubject.next(false);
          }
      });
  }

  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

}
