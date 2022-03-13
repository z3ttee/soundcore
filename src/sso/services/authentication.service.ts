import { Injectable } from "@angular/core";
import { KeycloakEvent, KeycloakEventType, KeycloakService } from "keycloak-angular";
import { BehaviorSubject, Observable, of } from "rxjs";
import { User } from "src/app/features/user/entities/user.entity";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: "root"
})
export class AuthenticationService {

    private readonly _readSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private readonly _userSubject: BehaviorSubject<User> = new BehaviorSubject(new User());

    // TODO
    public $token: Observable<string> = of(""); 
    // TODO
    public $user: Observable<User> = this._userSubject.asObservable();
    public $ready: Observable<boolean> = this._readSubject.asObservable();

    constructor(
        private keycloakService: KeycloakService
    ) {
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
        })

        keycloakService.loadUserProfile().then((profile) => {
            if(!profile) return;

            const user = new User();
            user.id = profile.id;
            user.username = profile.username;

            this._userSubject.next(user);
            this._readSubject.next(true);
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



}