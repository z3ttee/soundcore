import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { KeycloakAuthGuard, KeycloakService } from "keycloak-angular";

@Injectable({
    providedIn: 'root'
  })
export class KeycloakSSOGuard extends KeycloakAuthGuard {
      
    constructor(
      router: Router,
      protected readonly keycloak: KeycloakService
    ) {
      super(router, keycloak);
    }
  
    public async isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
      // Force the user to log in if currently unauthenticated.
      if (!this.authenticated) {
        await this.keycloak.login({
          redirectUri: window.location.origin + state.url
        });
      }

      return true;
    }
  }