import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot } from "@angular/router";
import { AllianceAuthService } from "../authentication.service";

@Injectable({
    providedIn: "root"
})
export class AllianceAuthGuard implements CanActivate, CanActivateChild {

    constructor(private readonly authService: AllianceAuthService) {}

    public async canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return this.checkAuthentication();
    }

    public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return this.checkAuthentication();
    }

    private async checkAuthentication(): Promise<boolean> {
        return this.authService.authenticate().then((allowed) => {
            console.log("allow access to route? ", allowed)
            return allowed
        })
    }

}