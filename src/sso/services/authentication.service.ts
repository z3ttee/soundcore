import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { User } from "src/app/features/user/entities/user.entity";
import { AllianceAuthService } from "src/lib/authentication/authentication.service";
import { AllianceAuthEvent } from "src/lib/authentication/events/auth.event";

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

    constructor(
        private keycloakService: AllianceAuthService
    ) {
        this.reloadSessionDetails();

        keycloakService.$keycloakEvent.subscribe((event: AllianceAuthEvent) => {
            if(event.type == "ready") {
                const authenticated = event.data as boolean;
                console.log("[AUTH] Auth handler initialized. User authenticated? ", authenticated)
            }

            if(event.type == "logout") {
                this._readSubject.next(false);
                this._userSubject.next(new User());
                console.log("[AUTH] User logged out.")
                window.location.reload();
            }

            if(event.type == "success") {
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
        this.keycloakService.logout();
    }

    public async goToAccount() {
        // this.keycloakService.getInstance().accountManagement()
    }

    private async reloadSessionDetails() {
        /*this.keycloakService.loadUserProfile().then((profile) => {
            if(!profile) return;

            const user = new User();
            user.id = profile.id;
            user.username = profile.username;

            this._userSubject.next(user);
            this._readSubject.next(true);

            this.keycloakService.getToken().then((token) => {
                this._tokenSubject.next(token)
            })
        })*/
    }



}