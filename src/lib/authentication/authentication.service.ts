import { Inject, Injectable } from "@angular/core";
import Keycloak from "keycloak-js";
import { BehaviorSubject, Observable, Subject } from "rxjs";
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
        @Inject("allianceAuthOptions") private readonly options: Keycloak.KeycloakConfig
    ) {
        this._instance = Keycloak(this.options)

        this._instance.authServerUrl = "https://sso.tsalliance.eu/auth"

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
                    console.log(error)
                    this._profileSubject.next(null);
                })
            }
        }

        this._readySubject.next(true);
    }

    public async authenticate(): Promise<boolean> {
        return this._instance.init({
            onLoad: "check-sso",
            silentCheckSsoRedirectUri: `${window.location.origin}/assets/silent-check-sso.html`
        }).then((authenticated) => {
            return authenticated
        }).catch((error: Error) => {
            console.error(error)
            return false;
        })
    }

    public async logout(redirectUri?: string): Promise<void> {
        this._instance.clearToken()
        this._instance.logout({
            redirectUri: redirectUri || window.location.origin
        })
    }

    private async loadUserProfile(): Promise<Keycloak.KeycloakProfile> {
        return this._instance.loadUserProfile()
    }

}