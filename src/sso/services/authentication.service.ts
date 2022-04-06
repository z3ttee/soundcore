import { Injectable } from "@angular/core";
import { KeycloakEvent, KeycloakEventType, KeycloakService } from "keycloak-angular";
import { BehaviorSubject, map, Observable } from "rxjs";
import { User } from "soundcore-sdk";
// import { User } from "src/app/features/user/entities/user.entity";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: "root"
})
export class AuthenticationService {

    private readonly _readSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private readonly _userSubject: BehaviorSubject<User> = new BehaviorSubject(new User());
    private readonly _tokenSubject: BehaviorSubject<string> = new BehaviorSubject(null);

    public $token: Observable<string> = this._tokenSubject.asObservable(); 
    public $user: Observable<User> = this._userSubject.asObservable();
    public $ready: Observable<boolean> = this._readSubject.asObservable();

    public $isAdmin: Observable<boolean> = this._userSubject.asObservable().pipe(map((user) => user.roles.includes(environment.admin_role)));
    public $isMod: Observable<boolean> = this._userSubject.asObservable().pipe(map((user) => user.roles.includes(environment.mod_role)));

    constructor(
        private keycloakService: KeycloakService
    ) {
        this.reloadSessionDetails();

        keycloakService.keycloakEvents$.subscribe((event: KeycloakEvent) => {
            if(event.type == KeycloakEventType.OnReady) {
                const authenticated = event.args[0] as boolean;
                console.log("[AUTH] Auth handler initialized. User authenticated? ", authenticated)
            }

            if(event.type == KeycloakEventType.OnAuthLogout) {
                this._readSubject.next(false);
                this._userSubject.next(new User());
                console.log("[AUTH] User logged out.")
                window.location.reload();
            }

            if(event.type == KeycloakEventType.OnAuthSuccess) {
                this.reloadSessionDetails()
                console.log("[AUTH] User logged in.")
            }
        })

        
    }

    public async getAccessToken() {
        return this.keycloakService.getToken()
    }

    public getUser(): User {
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

            const user = new User();
            user.id = profile.id;
            user.username = profile.username;
            user.roles = this.keycloakService.getUserRoles();

            this._userSubject.next(user);
            this._readSubject.next(true);

            this.keycloakService.getToken().then((token) => {
                this._tokenSubject.next(token)
            })
        })
    }



}