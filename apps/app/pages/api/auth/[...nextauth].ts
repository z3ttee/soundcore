import axios, { AxiosError } from "axios";
import NextAuth from "next-auth"
import { Profile } from "../../../entities/Profile";
import logger, { info } from "../../../lib/logging/logger";

import type { JWT } from "next-auth/jwt";

const OIDC_SCOPES = "openid email profile offline_access";

function buildKeycloakRealmURL() {
    return `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`;
}

function buildKeycloakWellKnownURL() {
    return `${buildKeycloakRealmURL()}/.well-known/openid-configuration`;
}

function buildKeycloakProtocolBaseURL() {
    return `${buildKeycloakRealmURL()}/protocol/openid-connect`;
}

function buildKeycloakAccessTokenURL() {
    return `${buildKeycloakProtocolBaseURL()}/token`;
}

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 * @param  {JWT} token
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        if (Date.now() > token.refreshTokenExpired) throw Error;
        const details = {
            client_id: process.env.KEYCLOAK_CLIENT_ID,
            client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
            grant_type: ['refresh_token'],
            refresh_token: token.refreshToken,
        };
        const formBody: string[] = [];
        Object.entries(details).forEach(([key, value]: [string, any]) => {
            const encodedKey = encodeURIComponent(key);
            const encodedValue = encodeURIComponent(value);
            formBody.push(encodedKey + '=' + encodedValue);
        });
        const formData = formBody.join('&');
        const url = `${process.env.KEYCLOAK_BASE_URL}/token`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
            body: formData,
        });

        const refreshedTokens = await response.json();
        if (!response.ok) throw refreshedTokens;

        logger.info(refreshedTokens);

        return {
          ...token,
          accessToken: refreshedTokens.access_token,
          accessTokenExpired: Date.now() + (refreshedTokens.expires_in - 15) * 1000,
          refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
          refreshTokenExpired:Date.now() + (refreshedTokens.refresh_expires_in - 15) * 1000,
        };
    } catch (error) {
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
};

export default NextAuth({
    providers: [
        {
            id: 'keycloak',
            name: 'Keycloak',
            type: 'oauth',
            version: '2.0',
            authorization: {
                params: {
                    scope: OIDC_SCOPES,
                    response_type: "code",
                    grant_type: 'authorization_code'
                },
                url: `${buildKeycloakProtocolBaseURL()}/auth`
            },
            jwks_endpoint: `${buildKeycloakProtocolBaseURL()}/certs`,
            accessTokenUrl: `${buildKeycloakProtocolBaseURL()}/token`,
            requestTokenUrl: `${buildKeycloakProtocolBaseURL()}/auth`,
            
            clientId: process.env.KEYCLOAK_CLIENT_ID,
            clientSecret: process.env.KEYCLOAK_SECRET,
            profileUrl: `${buildKeycloakProtocolBaseURL()}/userinfo`,
            profile: (profile) => {
                return {
                    ...profile,
                    id: profile.sub,
                };
            },
        }
    ],
    pages: {
        signIn: "/auth/signin"
    },
    session: {
        strategy: "jwt"
    },
    callbacks: {
        /**
         * @param  {object} user     User object
         * @param  {object} account  Provider account
         * @param  {object} profile  Provider profile
         * @return {boolean|string}  Return `true` to allow sign in
         *                           Return `false` to deny access
         *                           Return `string` to redirect to (eg.: "/auth/signin")
         */
        signIn: async ({ user, account, profile }) => {
            if(account && user) {
                return true;
            } else {
                return "/auth/signin";
            }
        },

        /**
         * @param  {string} url      URL provided as callback URL by the client
         * @param  {string} baseUrl  Default base URL of site (can be used as fallback)
         * @return {string}          URL the client will be redirect to
         */
        redirect: async ({ baseUrl, url }) => {
            return url.startsWith(baseUrl) ? url : baseUrl;
        },

        /**
         * @param  {object} session      Session object
         * @param  {object} token        User object    (if using database sessions)
         *                               JSON Web Token (if not using database sessions)
         * @return {object}              Session that will be returned to the client
         */
        session: async ({ token, session }) => {
            if(token) {
                session.user = token.user;
                session.error = token.error;
                session.accessToken = token.access_token;
            }

            return session;
        },

        /**
         * @param  {object}  token     Decrypted JSON Web Token
         * @param  {object}  user      User object      (only available on sign in)
         * @param  {object}  account   Provider account (only available on sign in)
         * @param  {object}  profile   Provider profile (only available on sign in)
         * @param  {boolean} isNewUser True if new user (only available on sign in)
         * @return {object}            JSON Web Token that will be saved
         */
        jwt: async ({ token, user, account }) => {
            // Initial sign in
            if (account && user) {
                // Add access_token, refresh_token and expirations to the token right after signin
                token.accessToken = account.accessToken;
                token.refreshToken = account.refreshToken;
                token.accessTokenExpired = Date.now() + (account.expires_in - 15) * 1000;
                token.refreshTokenExpired = Date.now() + (account.refresh_expires_in - 15) * 1000;
                token.user = user;
                return token;
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < token.accessTokenExpired) return token;

            // Access token has expired, try to update it
            return refreshAccessToken(token);
        }

        // session: async ({ session, token }) => {
        //     // Return type of session will be return type of useSession() hook

        //     if(token) {
        //         session.user = token.user;
        //         session.error = token.error;
        //         session.access_token = token.access_token;
        //     }

        //     return await axios.get(`${process.env.API_BASE}/v1/profiles/@me`, {
        //         headers: {
        //             "Authorization": `Bearer ${session.access_token}`
        //         }
        //     }).then((response) => {
        //         const profile = response.data as Profile;
        //         session.profile = profile;
        //         session.user.name = profile?.name || session.user.preferred_username;

        //         return session;
        //     }).catch((error: AxiosError) => {
        //         if(error.isAxiosError) {
        //             const data = error.response?.data;
        //             logger.error(`Could not fetch profile for user: ${data["message"]}`, error.stack);
        //         } else {
        //             logger.error(`Could not fetch profile for user: ${error.message}`, error);
        //         }
        //         return session;
        //     })
        // },
        // jwt: async ({ token, user, account }) => {

        //     // Initial signin:
        //     // Add access token to token object.
        //     // jwt function will be called before handing token
        //     // over to session callback
        //     if(account && user) {
        //         console.log("Account access token expires at: ", account.expires_at)

        //         token.access_token = account.access_token;
        //         token.access_token_expires_at = Date.now() + (account.expires_at - 15);
        //         token.refresh_token = account.refresh_token;
        //         token.refresh_token_expires_at = Date.now() + (account.refresh_expires_in - 15) * 1000;
        //         token.user = user;
        //         token.name = user.preferred_username;
        //     }

        //     info(token.access_token_expires_at);
            
        //     // Return previous token if the access token has not expired yet
        //     if (Date.now() < token.access_token_expires_at) {
        //         return token;
        //     }

        //     // Otherwise return refreshed access token
        //     return refreshAccessToken(token);
        // }
    }
})