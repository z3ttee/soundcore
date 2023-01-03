import { Algorithm } from "jsonwebtoken"

export interface JWTTokenHeader {
    alg: Algorithm;
    typ: "JWT";
    kid: string;
}

export interface KeycloakRealmAccess {
    roles: string[];
}

export class JWTTokenPayload {
    exp: number;
    iat: number;
    auth_time?: number;

    iss: string;
    sub: string;
    sid: string;
    jti?: string;
    azp?: string;
    typ: "Bearer" | string;
    nonce?: string;
    session_state?: string;
    email?: string;
    preferred_username?: string;
    name?: string;
}

export class KeycloakTokenPayload extends JWTTokenPayload {
    realm_access?: KeycloakRealmAccess;
}

export class JWTDecodedToken {
    header?: JWTTokenHeader;
    payload?: JWTTokenPayload;
    signature?: string;
}

export class KeycloakDecodedToken extends JWTDecodedToken {
    override payload?: KeycloakTokenPayload;
}