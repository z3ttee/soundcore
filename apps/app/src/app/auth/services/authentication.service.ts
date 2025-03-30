import { inject, Injectable } from "@angular/core";
import { Profile, Session } from "../types";
import { authorizationCodeGrant, buildAuthorizationUrl, buildEndSessionUrl, Configuration, discovery, fetchUserInfo, skipSubjectCheck, } from "openid-client";
import { DI_AUTH_OPTIONS, KEY_COOKIE_ACCESSTOKEN, KEY_COOKIE_IDTOKEN, KEY_COOKIE_REFRESHTOKEN } from "../constants";
import { isNull } from "@repo/utilities";
import { CookieService } from "./cookie.service";
import { BehaviorSubject, map } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";

@Injectable()
export class AuthenticationService {
    private readonly _options = inject(DI_AUTH_OPTIONS);
    private readonly _cookies = inject(CookieService);

    private readonly _router = inject(Router);
    private readonly _activatedRoute = inject(ActivatedRoute);

    private _config?: Configuration | null;

    private readonly _session = new BehaviorSubject<Session | null>(this.getSession());
    /** Subscribe to the current set of tokens for this session */
    public readonly $session = this._session.asObservable();

    private readonly _profile = new BehaviorSubject<Profile | null>(null);

    public readonly $authenticated = this.$session.pipe(map((session) => !!session && !!session.access_token));

    /**
     * Try authenticating the current user.
     * This will look for session infos locally and if not found, redirect to the authentication server.
     * @param redirect_uri URL to be redirected after successful authentication
     * @returns Observable that emits true if the user is authenticated, false otherwise
     */
    public async tryAuthenticate(redirect_uri: string): Promise<boolean> {
        const config = this._config;
        if (isNull(config)) {
            throw new Error("No metadata loaded. Please call loadMetadata() in APP_INITIALIZER.");
        }

        const params = new URLSearchParams(window.location.search);

        // Check if grant code exists and do token exchange
        return this._checkCodeGrantedAndExchange(params.get("state"), params.get("code")).then((authenticated) => {
            // On success, return and authenticate
            if (authenticated) return true;
            // Otherwise read session info
            const session = this.getSession();

            // When access token exists, the session is active
            if (session.access_token) {
                console.info("[Authentication] Found local session");
                this.loadProfile();
                return true;
            }

            // Try refreshing the session
            return this.refresh().then((authenticated) => {
                // On success we just return true
                if (authenticated) return true;

                // If we are not authenticated, redirect to the authentication page
                console.info("[Authentication] No active session found.");
                this.logout(false);
                return this.authenticate(redirect_uri).then(() => false)
            });
        });
    }

    /**
     * Redirect to user to the authentication page.
     * @param redirect_uri URL to which the user gets send after authentication
     */
    public async authenticate(redirect_uri: string): Promise<void> {
        const config = this._config;
        if (isNull(config)) throw new Error("No metadata loaded. Please call loadMetadata() in APP_INITIALIZER.");

        const params = new URLSearchParams({
            redirect_uri: redirect_uri,
            // Always include openid scope
            scope: `openid ${this._options.scope ?? ""}`,
            // state: this._config?.serverMetadata()?.supportsPKCE() ? randomState() : undefined,
            response_type: "code",
        })

        // Check if PKCE is supported
        if (this._config?.serverMetadata()?.supportsPKCE()) {
            // When supported, calculate challenge
            // const code_verifier = randomPKCECodeVerifier();
            // params.set("code_verifier", code_verifier);

            // await calculatePKCECodeChallenge(code_verifier).then((code_challenge) => {
            //     params.set("code_challenge", code_challenge);
            // })
        } else {
            // otherwise we rely on state
            // const state = randomState();
            // params.set("state", state);
        }

        window.open(buildAuthorizationUrl(config, params), "_self");
    }

    /** Refresh the current session */
    public async refresh(): Promise<boolean> {
        console.info("[Authentication] Refreshing session");

        const session = this.getSession();
        return false;
    }

    /** Get session tokens from cookies */
    public getSession(): Session {
        return {
            access_token: this._cookies.getOrDefault("access_token", undefined),
            id_token: this._cookies.getOrDefault("id_token", undefined),
            refresh_token: this._cookies.getOrDefault("refresh_token", undefined),
        }
    }

    /** Fetch metadata from the issuer. */
    public async loadMetadata(): Promise<Configuration> {
        this._config = null;

        return discovery(new URL(this._options.issuer), this._options.clientId).then((configuration) => {
            this._config = configuration;
            console.info("[Authentication] Loaded metadata from issuer", this._options.issuer);
            return configuration
        })
    }

    public async loadProfile(): Promise<Profile | null> {
        const config = this._config;
        if (isNull(config)) throw new Error("No metadata loaded. Please call loadMetadata() in APP_INITIALIZER.");

        const session = this.getSession();
        return fetchUserInfo(config, session.access_token, skipSubjectCheck).then((profile) => {
            this._profile.next(profile);
            console.info(`[Authentication] Loaded user profile for id ${profile.sub}`);
            return profile;
        })
    }

    public setSession(session: Session): void {
        this._cookies.set(this._getAccessTokenCookieKey(), session.access_token, session.expires_in);
        this._cookies.set(this._getRefreshTokenCookieKey(), session.access_token, 60 * 60 * 24 * 30);
        this._cookies.set(this._getIdTokenCookieKey(), session.id_token, session.expires_in);

        this._session.next(session);

        console.info("[Authentication] Session updated");

    }

    /** 
     * Clear the current session. 
     * NOTE: This only clears all data but does not explicitly logout the user */
    public clearSession(): void {
        this._cookies.delete(this._getAccessTokenCookieKey());
        this._cookies.delete(this._getRefreshTokenCookieKey());
        this._cookies.delete(this._getIdTokenCookieKey());
        this._session.next(null);

        console.info("[Authentication] Session cleared");
    }

    /** Logout user and clear session. The user will be sent to the logout page of the authentication server */
    public logout(redirect?: boolean): void {
        console.info("[Authentication] Logging out...");

        const currentSession = this.getSession();
        if (!isNull(currentSession)) {
            this.clearSession();

            if (redirect ?? true) {
                const endSessionUrl = buildEndSessionUrl(this._config, {
                    post_logout_redirect_uri: this._options.postLogoutRedirectUri ?? window.location.href,
                    id_token_hint: currentSession.id_token,
                });

                window.open(endSessionUrl, "_self");
            }

        }
    }

    private async _checkCodeGrantedAndExchange(state: string, code: string): Promise<boolean> {
        if (!this._config) throw new Error("No metadata loaded. Please call loadMetadata() in APP_INITIALIZER.");

        // Check if code exists, when not dont continue with exchange
        if (isNull(code)) {
            return false;
        }


        return authorizationCodeGrant(this._config, new URL(window.location.href), {
            // TODO: check if state/pkce code is valid
        }).then((tokenSet) => {
            console.info("[Authentication] Exchanged grant code for session tokens");
            this.setSession(tokenSet);
            this._clearQueryParams();
            return true;
        })
    }

    private _getAccessTokenCookieKey(): string {
        return this._options.cookies?.access_token ?? KEY_COOKIE_ACCESSTOKEN;
    }

    private _getRefreshTokenCookieKey(): string {
        return this._options.cookies?.refresh_token ?? KEY_COOKIE_REFRESHTOKEN;
    }

    private _getIdTokenCookieKey(): string {
        return this._options.cookies?.id_token ?? KEY_COOKIE_IDTOKEN;
    }

    private _clearQueryParams(): void {
        this._router.navigate([], {
            relativeTo: this._activatedRoute,
            queryParams: { code: null, code_verifier: null, code_challenge: null, state: null, iss: null, session_state: null },
            queryParamsHandling: 'merge',
            replaceUrl: true,
        })

        console.info("[Authentication] Cleared query parameters");
    }

}