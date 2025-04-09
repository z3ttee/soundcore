import { UserInfoResponse } from "openid-client";

export type Session = {
    readonly access_token?: string;
    readonly expires_at?: Date;
    readonly id_token?: string;
    readonly refresh_token?: string;
}

export type Profile = UserInfoResponse

export type AuthenticationModuleOptions = {
    /** URL to the issuer */
    readonly issuer: string;
    /** Id of the client */
    readonly clientId: string;
    /** Scope of the authentication requests. "openid" is always added */
    readonly scope?: string;
    /** 
     * URL to which the user gets send after 
     * successful session end on the authentication server 
     */
    readonly postLogoutRedirectUri?: string;
    /** Enable silently refreshing the session */
    readonly withSilentRefresh?: boolean;
    /** Cookie name settings */
    readonly cookies?: {
        /** Name of the access token cookie */
        readonly access_token?: string;
        /** Name of the refresh token cookie */
        readonly id_token?: string;
        /** Name of the id token cookie */
        readonly refresh_token?: string;
        /** Name of the cookie for storing the access token expiry */
        readonly expires_at?: string;
    }
}
