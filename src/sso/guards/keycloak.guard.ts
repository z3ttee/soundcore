import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";

@Injectable({
    providedIn: 'root'
  })
  export class KeycloakSSOGuard {
      
    constructor(
      router: Router,
      // protected readonly keycloak: KeycloakService
    ) {
      
    }
  
    public async isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
      return true
      // Force the user to log in if currently unauthenticated.
      /*if (!this.authenticated) {
        await this.keycloak.login({
          redirectUri: window.location.origin + state.url
        });
      }

      return true;*/
  
      /*// Get the roles required from the route.
      const requiredRoles = route.data.roles;
  
      // Allow the user to to proceed if no additional roles are required to access the route.
      if (!(requiredRoles instanceof Array) || requiredRoles.length === 0) {
        return true;
      }
  
      // Allow the user to proceed if all the required roles are present.
      return requiredRoles.every((role) => this.roles.includes(role));*/
    }
  }