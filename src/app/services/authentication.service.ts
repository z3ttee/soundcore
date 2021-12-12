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

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private readonly _sessionSubject = new BehaviorSubject(SSOSession.anonymous());
  private readonly _userSubject = new BehaviorSubject(null);
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

  constructor(private httpClient: HttpClient) {
    this.restoreSession().then(() => {
      this._sessionSubject.pipe(skip(1)).subscribe((session) => {
        // Subscribe to session changes.
        // If session is null or anonymous, proceed with login
        // Otherwise persist session updates.
        if(!session || session.type == SSOSessionType.SESSION_ANONYMOUS) this.redirectToAuthentication();
        else this.persistSession(session);
      })

      this.restoreUser().then(() => {
        this._userSubject.pipe(skip(1)).subscribe((user) => {
          this.persistUser(user)
        })
      }).catch(() => {
        // User data did not exist, but session does.
        // So we try to fetch user's data.
        this.findAndPersistCurrentUser()
      })
    }).catch(() => {
      this._sessionSubject.next(SSOSession.anonymous())
    }).finally(() => {
      this._readySubject.next(true);
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
   * Restore session from cookie.
   */
  private async restoreSession() {
    const cookieValue: any = CookieApi.get(SESSION_COOKIE_NAME)
    // No need to push anonymous session, as the default value in subject is anonymous
    if(!cookieValue) throw new Error("Session not found.");

    const session = new SSOSession(cookieValue);
    this._sessionSubject.next(session);
  }

  /**
   * Restore user data from localStorage.
   */
  private async restoreUser() {
    const data: SSOUser = JSON.parse(localStorage.getItem(USER_LOCALSTORAGE)) || null;
    if(!data) throw new Error("User data not found.");

    this._userSubject.next(data);
    // Update user data in background
    this.findAndPersistCurrentUser();
  }

  /**
   * Redirect user to authentication page to obtain grantCode.
   */
  public async redirectToAuthentication() {
    window.location.href = `https://account.tsalliance.eu/authorize?client_id=${environment.sso_client_id}&redirect_uri=${environment.sso_redirect_uri}`
  }

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
    if(!session || session.type == SSOSessionType.SESSION_ANONYMOUS || !session.accessToken) {
      CookieApi.remove(SESSION_COOKIE_NAME);
    } else {
      CookieApi.set(SESSION_COOKIE_NAME, session.accessToken!, { expires: session.expiresAt })
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
    if(!user) localStorage.removeItem(USER_LOCALSTORAGE);
    else localStorage.setItem(USER_LOCALSTORAGE, JSON.stringify(user))
  }

  /**
   * Find currently logged in users data by providing the request with the currently available accessToken of the session.
   * @returns SSOUser
   */
  public async findCurrentUser(): Promise<SSOUser> {
    return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/authentication/user/@me`, {
      headers: {
        'Authorization': `Bearer ${this.getSession().accessToken}`
      }
    })).then((response) => response as SSOUser)
  }

  /**
   * Find currently logged in users data by providing the request with the currently available accessToken of the session.
   * If it was successful, then the fetched data is pushed and persisted to localStorage.
   * @returns SSOUser
   */
  public async findAndPersistCurrentUser(): Promise<SSOUser> {
    return this.findCurrentUser().then((user) => {
      this.updateUser(user);
      return user;
    }).catch((error) => {
      console.warn("[SSO] Could not fetch user data: ", error);
      // TODO: Show error as toast?
      return null;
    })
  }


}
