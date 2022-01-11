import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, firstValueFrom, map, Observable, skip } from 'rxjs';

import CookieApi from "js-cookie"
import { SESSION_COOKIE_NAME, USER_LOCALSTORAGE } from '../constants';
import { environment } from 'src/environments/environment';
import { SSOSession, SSOSessionType } from '../model/session.model';
import { SSOCreateAuthorizationDTO } from '../dto/create-authorization.dto';
import { SSOAccessToken } from '../model/sso-access-token.entity';
import { SSOUser } from '../model/sso-user.model';

export interface SSOConfig {

}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  // TODO: Make sure user never gets null

  private readonly _sessionSubject = new BehaviorSubject(SSOSession.anonymous());
  private readonly _userSubject = new BehaviorSubject(SSOUser.anonymous());
  private readonly _readySubject = new BehaviorSubject(false);

  /**
   * Session observable to provide session changes to other services
   */
  public readonly $session: Observable<SSOSession> = this._sessionSubject.asObservable();
  public readonly $user: Observable<SSOUser> = this._userSubject.asObservable();

  /**
   * Ready observable. This provides info on the progress of authentication.
   * The values most likely change during application init, as the session will be restored
   * from cookies / localStorage.
   */
  public readonly $ready: Observable<boolean> = this._readySubject.asObservable();
  public readonly $isLoggedIn: Observable<boolean> = combineLatest([this.$session, this.$ready]).pipe(map(([session, ready]) => (ready && !!session && session.type != SSOSessionType.SESSION_ANONYMOUS)))

  /*public static forRoot(config: SSOConfig): ModuleWithProviders<GreetingModule> {
    return {
      ngModule: GreetingModule,
      providers: [
        {provide: UserServiceConfig, useValue: config }
      ]
    };
  }*/

  constructor(private httpClient: HttpClient) {
    this.restoreSession().then((session) => {
      // Push restored session
      this._sessionSubject.next(session)

      // Subscribe to session changes.
      // If session is null or anonymous, proceed with login
      // Otherwise persist session updates.
      this._sessionSubject.pipe(skip(1)).subscribe((session) => {
        if(!session || session.type == SSOSessionType.SESSION_ANONYMOUS) this.redirectToAuthentication();
        else this.persistSession(session);
      })

      this.restoreUser().then((user) => {
        this._userSubject.next(user)

        // User data was found, but it may be outdated.
        // This is why the below function is called which fetches
        // the user's data and persists it as well as updating the app state
        this.findAndUpdateCurrentUser();
      })
    }).finally(() => {
      // The restore session process is done.
      // For this value we don't care if the session is anonymous or not.
      // This must be handled in different places in the app.
      setTimeout(() => this._readySubject.next(true), 100)
    })
  }

  /**
   * Get snapshot of the current session.
   * @returns SSOSession
   */
  public getSession(): SSOSession {
    return this._sessionSubject.getValue();
  }

  /**
   * Get snapshot of the current session's access token.
   * @returns string
   */
   public getAccessToken(): string {
    return this._sessionSubject.getValue().accessToken;
  }

  /**
   * Get snapshot of the current user.
   * @returns SSOUser
   */
   public getUser(): SSOUser {
    return this._userSubject.getValue();
  }

  /**
   * Restore session from cookie. If no cookie exists, an anonymous session is returned
   * @returns SSOSession
   */
  private async restoreSession(): Promise<SSOSession> {
    console.log("[SSO] Checking local session.")
    const cookieValue: any = CookieApi.get(SESSION_COOKIE_NAME)

    // No need to push anonymous session, as the default value in subject is anonymous
    if(!cookieValue) {
      console.warn("[SSO] No active session found. Continuing in anonymous mode.")
      await this.logoutWithoutUpdate();
      const session = SSOSession.anonymous();
      return session;
    }

    const session = new SSOSession(cookieValue);
    console.log("[SSO] Active session found.")
    return session;
  }

  /**
   * Restore user data from localStorage.
   */
  private async restoreUser(): Promise<SSOUser> {
    console.log("[SSO] Checking local user data.")

    const session = this.getSession();
    const data: SSOUser = JSON.parse(localStorage.getItem(USER_LOCALSTORAGE)) || SSOUser.anonymous();

    if(session.type == SSOSessionType.SESSION_ANONYMOUS) {
      console.warn("[SSO] No user data found or session anonymous. Switching to anonymous user instance.")
      return data;
    }

    console.log("[SSO] Found user data for username: ", data.username)
    return data;
  }

  /**
   * Redirect user to authentication page to obtain grantCode.
   */
  public async redirectToAuthentication() {
    window.location.href = `https://account.tsalliance.eu/authorize?client_id=${environment.sso_client_id}&redirect_uri=${environment.sso_redirect_uri}`
  }

  /**
   * Request access token from AllianceSSO endpoint by providing grantCode.
   * @param createAuthorizationDto Data to request access token with
   * @returns SSOAccessToken
   */
  public async authorize(createAuthorizationDto: SSOCreateAuthorizationDTO): Promise<SSOAccessToken> {
    return firstValueFrom(this.httpClient.post(`${environment.api_base_uri}/v1/authentication/authorize`, createAuthorizationDto)) as Promise<SSOAccessToken>
  }

  /**
   * Update session data. This pushes update to observables and persists token as cookie.
   * @param session Session data to update
   */
  public async updateSession(session: SSOSession) {
    this._sessionSubject.next(session);
    this.persistSession(session);
  }

  /**
   * Write access token to cookie.
   * @param session Data to persist
   */
  private async persistSession(session: SSOSession) {
    console.log("presist session: ", session)
    if(!session || session.type == SSOSessionType.SESSION_ANONYMOUS || !session.accessToken) {
      CookieApi.remove(SESSION_COOKIE_NAME);
    } else {
      CookieApi.set(SESSION_COOKIE_NAME, session.accessToken!, { expires: session.expiresAt || 365 })
    }
  }

  /**
   * Update user data. This pushes update to observables and persists data in localStorage.
   * @param user User data to update
   */
  public async updateUser(user: SSOUser) {
    this._userSubject.next(user);
    this.persistUser(user);
  }

  /**
   * Write user data to localStorage.
   * @param user Data to persist
   */
   private async persistUser(user: SSOUser) {
    if(!user || user.isAnonymous) localStorage.removeItem(USER_LOCALSTORAGE);
    else localStorage.setItem(USER_LOCALSTORAGE, JSON.stringify(user))
  }

  /**
   * Find currently logged in users data by providing the request with the currently available accessToken of the session.
   * @returns SSOUser
   */
  public async findCurrentUser(): Promise<SSOUser> {
    const session = this.getSession();
    if(!session || session.type == SSOSessionType.SESSION_ANONYMOUS) return SSOUser.anonymous();

    return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/authentication/user/@me`, { headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    })).then((response) => response as SSOUser).catch(() => SSOUser.anonymous())
  }

  /**
   * Find currently logged in users data by providing the request with the currently available accessToken of the session.
   * If it was successful, then the fetched data is pushed and persisted to localStorage.
   * @returns SSOUser
   */
  public async findAndUpdateCurrentUser(): Promise<SSOUser> {
    return this.findCurrentUser().then((user) => {
      if(user) this.updateUser(user);
      return user;
    }).catch((error) => {
      console.warn("[SSO] Could not fetch user data: ", error);
      // TODO: Show error as toast?
      return null;
    })
  }

  /**
   * Logout user by setting user to null and session to an anonymous session.
   */
  public async logout(): Promise<void> {
    console.warn("[SSO] Loggin out user.")
    await this.updateUser(SSOUser.anonymous());
    await this.updateSession(SSOSession.anonymous())
  }

  /**
   * Logout user by setting user to null and session to an anonymous session.
   * This method will not push updates to the application state.
   */
  private async logoutWithoutUpdate(): Promise<void> {
    console.warn("[SSO] Loggin out user without active update.")
    await this.persistUser(SSOUser.anonymous());
    await this.persistSession(SSOSession.anonymous())
  }


}
