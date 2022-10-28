import { Injectable } from "@angular/core";
import { KeycloakEvent, KeycloakEventType, KeycloakService } from "keycloak-angular";
import { BehaviorSubject, map, Observable } from "rxjs";
import { SSOUser } from "../entities/user.entity";
import { SSOModuleOptionsImpl } from "../sso.module";

@Injectable({
    providedIn: "root"
})
export class SSOService {

    private readonly _readSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private readonly _userSubject: BehaviorSubject<SSOUser> = new BehaviorSubject(new SSOUser());
    private readonly _tokenSubject: BehaviorSubject<string> = new BehaviorSubject("");

    public $token: Observable<string> = this._tokenSubject.asObservable(); 
    public $user: Observable<SSOUser> = this._userSubject.asObservable();
    public $ready: Observable<boolean> = this._readSubject.asObservable();

    public $isAdmin: Observable<boolean> = this._userSubject.asObservable().pipe(map((user) => user.roles.includes(this.options.roleMapping?.admin || "admin")));
    public $isMod: Observable<boolean> = this._userSubject.asObservable().pipe(map((user) => user.roles.includes(this.options.roleMapping?.mod || "mod")));

    constructor(
        private readonly keycloakService: KeycloakService,
        private readonly options: SSOModuleOptionsImpl
    ) {
        this.reloadSessionDetails();

        keycloakService.keycloakEvents$.subscribe((event: KeycloakEvent) => {
            if(event.type == KeycloakEventType.OnReady) {
                const authenticated = (event.args as unknown[])?.[0] as boolean || false;
                console.log("[AUTH] Auth handler initialized. User authenticated? ", authenticated)
            } else if(event.type == KeycloakEventType.OnAuthLogout) {
                this._readSubject.next(false);
                this._userSubject.next(new SSOUser());
                console.log("[AUTH] User logged out.")
                window.location.reload();
            } else if(event.type == KeycloakEventType.OnAuthSuccess) {
                this.reloadSessionDetails()
                console.log("[AUTH] User logged in.")
            } else if(event.type == KeycloakEventType.OnTokenExpired) {
                this.keycloakService.updateToken().catch((error) => {
                    console.error(error);
                    this.logout().then(() => this.keycloakService.login());
                })             
            } else {
                console.log(event)
            }
        })

        
    }

    public async getAccessToken() {
        return this.keycloakService.getToken()
    }

    public getUser(): SSOUser {
        return this._userSubject.getValue();
    }

    public async logout() {
        this.keycloakService.logout().then(() => {
            this.keycloakService.clearToken()
        });
    }

    public async goToAccount() {
        this.keycloakService.getKeycloakInstance().accountManagement()
    }

    private async reloadSessionDetails() {
        this.keycloakService.loadUserProfile().then((profile) => {
            if(!profile) return;

            const user = new SSOUser(profile.id, profile.username, this.keycloakService.getUserRoles());

            this._userSubject.next(user);
            this._readSubject.next(true);

            this.keycloakService.getToken().then((token) => {
                this._tokenSubject.next(token)
            })
        })
    }



}