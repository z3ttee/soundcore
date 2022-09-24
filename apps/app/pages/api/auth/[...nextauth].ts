import axios from "axios";
import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt";
import { Profile } from "../../../entities/Profile";

function buildKeycloakRealmURL() {
    return `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`;
}

function buildKeycloakWellKnownURL() {
    return `${buildKeycloakRealmURL()}/.well-known/openid-configuration`;
}

function buildKeycloakProtocolBaseURL() {
    return `${buildKeycloakRealmURL()}/openid-connect`;
}

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 * @param  {JWT} token
 */
async function refreshAccessToken(token: JWT) {
    try {
      if (Date.now() > token.refresh_token_expires_at) throw Error;

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
      return {
        ...token,
        accessToken: refreshedTokens.access_token,
        accessTokenExpired: Date.now() + (refreshedTokens.expires_in - 15) * 1000,
        refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        refreshTokenExpired:
          Date.now() + (refreshedTokens.refresh_expires_in - 15) * 1000,
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
            // params: { 
            //     grant_type: 'authorization_code',
            // },
            wellKnown: `${buildKeycloakWellKnownURL()}`,
            authorization: {
                params: {
                    scope: 'openid email profile',
                    response_type: "code"
                },
                url: `${buildKeycloakProtocolBaseURL()}/auth`
            },
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
        session: async ({ session, token }) => {
            // Return type of session will be return type of useSession() hook

            if(token) {
                session.user = token.user;
                session.error = token.error;
                session.access_token = token.access_token;
            }

            return await axios.get(`${process.env.API_BASE}/v1/profiles/@me`, {
                headers: {
                    "Authorization": `Bearer ${token.access_token}`
                }
            }).then((response) => {
                const profile = response.data as Profile;
                session.profile = profile;
                session.user.name = profile?.name || session.user.preferred_username;

                return session;
            }).catch((error) => {
                console.log(error);
                return session;
            })
        },
        jwt: async ({ token, user, account }) => {

            // Initial signin:
            // Add access token to token object.
            // jwt function will be called before handing token
            // over to session callback
            if(account && user) {
                token.access_token = account.access_token;
                token.access_token_expires_at = account.expires_at;
                token.refresh_token = account.refresh_token;
                token.refresh_token_expires_at = Date.now() + (account.refresh_expires_in - 15) * 1000;
                token.user = user;
                token.name = user.preferred_username;
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < token.access_token_expires_at) return token;

            // Otherwise return refreshed access token
            return refreshAccessToken(token);
        }
    }
})