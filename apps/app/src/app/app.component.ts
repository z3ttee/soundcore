import { AfterViewInit, Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { SSOService } from '@soundcore/sso';
import { BehaviorSubject, combineLatest, filter, map, Observable, startWith, Subject, takeUntil, tap } from 'rxjs';
import { SCCDKScreenService } from '@soundcore/cdk';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from './auth/services/authentication.service';

interface AppProps {
  ready?: boolean;
  keycloakInitError?: Error;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

  // public readonly authService: SSOService = inject(SSOService);
  public readonly authService = inject(AuthenticationService);
  public readonly screenService: SCCDKScreenService = inject(SCCDKScreenService);
  private readonly router: Router = inject(Router);

  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  private _loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public $isRouteLoading: Observable<boolean> = this._loadingSubject.asObservable();

  // public readonly $props: Observable<AppProps> = combineLatest([
  //   this.$isRouteLoading.pipe(filter((isLoading) => !isLoading)),
  //   // this.authService.$ready.pipe(filter((isReady) => isReady)),
  //   // this.authService.$onInitError.pipe(startWith(null)),
  //   this.appService.$appInfo.pipe(tap((appInfo) => {
  //     console.log(`Successfully contacted backend application on '${environment.api_base_uri}/v1'. Version: ${appInfo?.build?.version}, Application mode: ${appInfo?.isDockerized ? 'Docker' : 'Standalone'}`);
  //   })),
  // ]).pipe(
  //   map(([isRouteLoading, isReady]): AppProps => {
  //     // Toggle splash element
  //     const splashElement: HTMLElement = document.querySelector("#asc-splash-screen");
  //     if (!isRouteLoading && isReady) {
  //       splashElement.style.display = "none";
  //     } else {
  //       splashElement.style.display = "block";
  //     }

  //     return {
  //     }
  //   }),
  //   takeUntil(this.$destroy)
  // );

  public ngOnInit(): void {



    // this.router.events.pipe(filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError)).subscribe((event: NavigationStart | NavigationEnd) => {
    //   if (event instanceof NavigationStart) {
    //     this._loadingSubject.next(true);
    //   } else {
    //     this._loadingSubject.next(false);
    //   }
    // });


  }

  public ngAfterViewInit(): void {
    this.authService.$authenticated.pipe(filter((authenticated) => authenticated)).subscribe(() => {
      const splashElement: HTMLElement = document.querySelector("#asc-splash-screen");
      if (!splashElement) return;
      splashElement.style.display = "none";
    })
  }

  public ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

}
