import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AuthService } from "@auth0/auth0-angular";
import { combineLatest, filter, firstValueFrom, map, Observable, tap, zip } from "rxjs";
import { environment } from "src/environments/environment";
import { SSOSession, SSOSessionType } from "../model/session.model";
import { AuthenticationService } from "../services/authentication.service";

@Injectable({
    providedIn: "root"
})
export class AuthenticationCanActivateGuard implements CanActivate {

    constructor(
        private authService: AuthenticationService
    ) {}

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

        return firstValueFrom(this.authService.$isAuthenticated).then((isAuthenticated) => {
            if(!isAuthenticated) {
                // Authenticate
                this.authService.redirectToAuthentication()
                return false;
            }

            return true;
        })

        /*this.auth0.isAuthenticated$.subscribe((authenticated) => {
            console.log(authenticated)
        })

        this.auth0.user$.subscribe((user) => {
            console.log(user)
        })*/

        return true;
        /*return new Promise((resolve, reject) => {
            zip([
                this.authService.$ready.pipe(filter((ready) => ready)),
                this.authService.$session
            ]).pipe(
                map(([ready, session]) => ({ ready, session })),
            ).subscribe((state) => {
                const navigationGranted = state.ready && state.session.type != SSOSessionType.SESSION_ANONYMOUS;
                const grantCode = route.paramMap.get("code");

                // No grantCode and session is anonymous
                if(!grantCode && !navigationGranted) {
                    console.log(window.location.href)
                    // this.authService.redirectToAuthentication().then(() => resolve(true))
                    return;
                }

                if(grantCode) {
                    firstValueFrom(this.auth0.handleRedirectCallback()).then((result) => {
                        console.log(result)
                    })
                    return;
                }

                resolve(true);

                //console.log(route)*/

                //console.log(isAuthorizeRoute)
                // http://localhost:4200/authorize?code=AEUHHmyRdhr07mpA_LkObXPEqBQkwMiLfPYdmPpCtlEZN&state=OWtVQUZlc0c0ZUticjlaYlQyLS1YWTJuZEZydFhCOVRiYTl4Li1LNURScQ%3D%3D
// this.authService.
                // return
                /*if(isAuthorizeRoute) {
                    if(navigationGranted) {
                        // User still logged in but somehow tries to route to authorize ?!
                        // Navigate back to homepage

                        this.router.navigate([""], { replaceUrl: true })
                        resolve(true)
                    } else {
                        // User session not valid, but the authorize route was accessed
                        // That means, either the user was navigated automatically to this page
                        // by the app or he was moved here after logging in.
                        const grantCode = route.queryParamMap.get("code");

                        // If he was moved here after login, that means there must be a grantCode.
                        if(grantCode) {
                            // User has logged in and now wants to be authenticated using this grantCode
                            this.authService.authorize({ grantCode, redirectUri: environment.sso_redirect_uri }).then((response) => {
                                console.log(response)

                                const session: SSOSession = new SSOSession(response.accessToken);
                                session.type = SSOSessionType.SESSION_USER;
                                session.expiresAt = response.expiresAt;
                    
                                // Persists session on success
                                this.authService.updateSession(session).then(() => {
                                    this.router.navigate(["/"], { replaceUrl: true })

                                    // Persist user data, if finding the data was successful
                                    this.authService.findAndUpdateCurrentUser().then(() => {
                                        
                                    })

                                    return
                                });

                            }).catch((reason: HttpErrorResponse) => {
                                console.log("Error code " + reason.status + "")
                                console.error(reason.error)

                                if(reason.error?.message == "Invalid grant code.") {
                                    this.authService.redirectToAuthentication().then(() => resolve(true))
                                    return;
                                }
                            })

                        } else {
                            // No grantCode found in query string. Meaning the user is not logged in
                            // and requires to be navigated to authentication vendor
                            console.log("no grant code")
                            // this.authService.redirectToAuthentication().then(() => resolve(true))
                            return
                        }

                    }
                } else {
                    // User did not access the /authorize route.
                    // Therefor check, if the session is valid. If not,
                    // navigate to /authorize page
                    if(!navigationGranted) {
                        // this.authService.redirectToAuthentication().then(() => resolve(true))
                        return
                    }
                }

                resolve(true)
            })
        })
        return true;*/
    }

}