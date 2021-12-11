
export enum SSOSessionType {
    SESSION_ANONYMOUS = "anonymous",
    SESSION_USER = "user"
}

/**
 * In context of SSO auth flow, the SSOSession class
 * is actually somehow equal to SSOAccessToken.
 * It holds the accessToken and its expiry.
 * Additional to that there is a sessionType to differentiate
 * anonymous sessions and proceed with login.
 */
export class SSOSession {

    public type: SSOSessionType = SSOSessionType.SESSION_USER;
    public accessToken: string = "";
    public expiresAt?: Date;

    constructor(token: string) {
        this.accessToken = token;
        this.type = SSOSessionType.SESSION_USER;
    }

    public static anonymous(): SSOSession {
        return {
            type: SSOSessionType.SESSION_ANONYMOUS,
            accessToken: ""
        }
    }

}