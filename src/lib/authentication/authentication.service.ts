import { Inject, Injectable } from "@angular/core";
import Keycloak from "keycloak-js";
import { BehaviorSubject, filter, firstValueFrom, Observable, Subject, take } from "rxjs";
import { AllianceAuthConfig } from "./configs/auth-config";
import { AllianceAuthEvent, AllianceAuthEventType } from "./events/auth.event";

@Injectable()
export class AllianceAuthService {

    private _instance: Keycloak.KeycloakInstance;
    private _eventSubject: Subject<AllianceAuthEvent> = new Subject();
    private _readySubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _authenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _profileSubject: BehaviorSubject<Keycloak.KeycloakProfile> = new BehaviorSubject(null);

    /**
     * Emits native keycloak-js events.
     */
    public $keycloakEvent: Observable<AllianceAuthEvent> = this._eventSubject.asObservable();

    /**
     * Emits a value after authentication status has changed.
     */
    public $authenticated: Observable<boolean> = this._authenticatedSubject.asObservable();

    /**
     * Emits a value after a user was authenticated and the profile has been loaded.
     * This will emit null on errors and if not yet authenticated.
     */
    public $profile: Observable<Keycloak.KeycloakProfile> = this._profileSubject.asObservable();

    /**
     * Emits a value after initialisation is completed.
     */
    public $ready: Observable<boolean> = this._readySubject.asObservable();

    constructor(
        @Inject("allianceAuthOptions") public readonly options: AllianceAuthConfig
    ) {
        this._instance = Keycloak(this.options.config)

        this._instance.onAuthSuccess = () => this._eventSubject.next(new AllianceAuthEvent("success"))
        this._instance.onAuthError = (errorData: Keycloak.KeycloakError) => this._eventSubject.next(new AllianceAuthEvent("error", errorData))
        this._instance.onAuthLogout = () => this._eventSubject.next(new AllianceAuthEvent("logout"))
        this._instance.onAuthRefreshSuccess = () => this._eventSubject.next(new AllianceAuthEvent("refreshSuccess"))
        this._instance.onAuthRefreshError = () => this._eventSubject.next(new AllianceAuthEvent("refreshError"))

        this._instance.onReady = (authenticated) => {
            this._authenticatedSubject.next(authenticated)
            this._eventSubject.next(new AllianceAuthEvent("success", authenticated))

            if(authenticated) {
                this.loadUserProfile().then((profile) => this._profileSubject.next(profile)).catch((error: Error) => {
                    console.error(error)
                    this._profileSubject.next(null);
                })
            }
        }

        this._readySubject.next(true);
    }

    public async isAuthenticated(): Promise<boolean> {
        return this.updateToken().then(() => {
            return this._authenticatedSubject.getValue();
        }).catch(() => {
            return false;
        })
    }

    public async login(redirectUri?: string): Promise<void> {
        return this._instance.init(this.options.init).then((authenticated) => {
            if(authenticated) {
                return null;
            } else {
                return this._instance.login({
                    redirectUri: redirectUri || window.location.origin,
                })
            }
        })
    }

    public async logout(redirectUri?: string): Promise<void> {
        this._instance.clearToken()
        this._instance.logout({
            redirectUri: redirectUri || window.location.origin
        })
    }

    public async getToken(): Promise<string> {
        return this.updateToken().then(() => {
            return this._instance.token
        }).catch((error) => {
            return null;
        })
    }

    public isTokenExpired(minValidity: number = 0): boolean {
        return this._instance.isTokenExpired(minValidity);
    }

    public async updateToken(): Promise<boolean> {
        const validity = 10;

        console.log(this.isTokenExpired(validity))

        if(this.isTokenExpired(validity)) {
            this.logout();
            return false;
        }

        return this._instance.updateToken(validity).then(() => true).catch((error) => {
            console.error(error);
            return false
        })
    }

    private async loadUserProfile(): Promise<Keycloak.KeycloakProfile> {
        return firstValueFrom(this.$ready.pipe(filter((isReady) => isReady))).then(() => {
            return this._instance.loadUserProfile()
        })
    }

}