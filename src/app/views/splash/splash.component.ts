import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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
          this.authService.authorize({ grantCode, redirectUri: environment.sso_redirect_uri}).catch((errorResponse: HttpErrorResponse) => {
            if(errorResponse.status != 0) {
              this.authService.redirectToAuthentication();
            } else {
              // TODO: Show error to user. These are browser javascript errors (Network, TypedError etc)
              if(errorResponse.statusText == "Network Error") {
                this.errorMessage = "Es ist ein Netzwerkfehler aufgetreten.";
              } else {
                this.errorMessage = "In der Anwendung ist ein unbekannter Fehler aufgetreten. Installiere ggf. die aktuellste Version.";
              }
            }

            return null;
          }).then((response) => {
            const session: SSOSession = response;
            // Persists session on success
            this.authService.updateSession(session).then(() => {
              this.authService.findCurrentUser().then((user) => {
                console.log(user)
                // Persist user data, if finding the data was successful
                this.authService.updateUser(user).then(() => {
                  this.router.navigate(["/"])
                });
              })
            });
          })
        }
      } else {
        // User still logged in, do nothing?
      }
    })

  }

}
