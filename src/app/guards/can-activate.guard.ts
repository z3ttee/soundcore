import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AuthenticationService } from "../services/authentication.service";

export class AuthenticationCanActivateGuard implements CanActivate {

    constructor(private authService: AuthenticationService) {}

    public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
        
        console.log(state.url)

        return true;
    }

}