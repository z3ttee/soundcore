import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { KeycloakAuthGuard, KeycloakService } from "keycloak-angular";

@Injectable({
    providedIn: 'root'
})
export class SSOGuard extends KeycloakAuthGuard {
      
    constructor(
      router: Router,
      protected readonly keycloak: KeycloakService,
    ) {
      super(router, keycloak);
    }
  
    public async isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
      // Force the user to log in if currently unauthenticated.
      if (!this.authenticated) {
        await this.keycloak.login({
          redirectUri: window.location.origin + state.url
        });
      }

      // Check if user has the required role to access
      // the route.
      const requiredRole: string = route.data["role"];
      if(requiredRole && !this.keycloak.isUserInRole(requiredRole)) {
        return this.router.createUrlTree(["/"]);
      }

      return true;
    }
  }