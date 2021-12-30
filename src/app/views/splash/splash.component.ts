import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ActivationEnd, NavigationEnd, ResolveEnd, ResolveStart, Router, RoutesRecognized } from '@angular/router';
import { filter, first, map, skip, zip } from 'rxjs';
import { SSOSession, SSOSessionType } from 'src/app/model/session.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'asc-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {

  @Input() public appTitle: string;
  @Input() public subtitle: string;
  @Input() public appLogoUri: string;
  @Input() public active: boolean = true;

  public errorMessage: string;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private authService: AuthenticationService) { }

  public ngOnInit(): void {
    zip([
      this.authService.$ready.pipe(filter((ready) => ready)),
      this.router.events.pipe((filter((event) => event instanceof ActivationEnd)), map((event) => event as NavigationEnd))
    ]).pipe(map(() => {return})).subscribe(() => {
      const queryMap = this.activatedRoute.snapshot.queryParamMap;
      const session = this.authService.getSession();
      const grantCode = queryMap.get("code");

      if(session.type == SSOSessionType.SESSION_ANONYMOUS) {
        if(!grantCode){
          this.authService.redirectToAuthentication();
        } else {
          // Login user using the grantCode
          this.authService.authorize({ grantCode, redirectUri: environment.sso_redirect_uri}).then((response) => {
            if(!response) return;

            const session: SSOSession = new SSOSession(response.accessToken);
            session.type = SSOSessionType.SESSION_USER;
            session.expiresAt = response.expiresAt;

            console.log(session)

            // Persists session on success
            this.authService.updateSession(session).then(() => {
              // Persist user data, if finding the data was successful
              this.authService.findAndUpdateCurrentUser().then(() => {
                this.router.navigate(["/"])
              })
            });
          }).catch((errorResponse: HttpErrorResponse) => {
            
            if(errorResponse.status != 200) {
              if(errorResponse.status == 0) {
                // TODO: Show error to user. These are browser javascript errors (Network, TypedError etc)
                this.errorMessage = "Ein unerwarteter Netzwerkfehler ist aufgetreten.";
                return
              }

              this.authService.redirectToAuthentication();
            } 

            return null;
          })
        }
      } else {
        // TODO: User still logged in, do nothing?
      }
    })

  }

}
