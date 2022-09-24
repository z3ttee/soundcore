import type { User } from "next-auth";
import { Profile } from "./entities/Profile";

declare module 'next-auth' {

    interface Session {
        user: {
            sub: string;
            email_verified: boolean;
            name: string;
            preferred_username: string;
            given_name: string;
            family_name: string;
            email: string;
            id: string;
            org_name?: string;
            telephone?: string;
        };
        profile?: Profile;
        access_token: string;
        error: string;
    }

    interface User {
        sub: string;
        email_verified: boolean;
        name: string;
        telephone: string;
        preferred_username: string;
        org_name: string;
        given_name: string;
        family_name: string;
        email: string;
        id: string;
    }

    interface Account {
        provider: string;
        type: string;
        providerAccountId: string;
        token_type: string;
        session_state: string;
        'not-before-policy': number;
        scope: string;

        accessTokenExpires?: any;
        refreshToken: string;

        access_token: string;
        expires_at: number;

        refresh_token: string;
        refresh_expires_in: number;

        id_token: string;
    }

    // interface Profile {
    //     sub: string;
    //     email_verified: boolean;
    //     name: string;
    //     telephone: string;
    //     preferred_username: string;
    //     org_name: string;
    //     given_name: string;
    //     family_name: string;
    //     email: string;
    // }

}

declare module 'next-auth/jwt' {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
      name: string;
      email: string;
      sub: string;
      name: string;
      email: string;
      sub: string;

      access_token: string;
      access_token_expires_at: number;

      refresh_token: string;
      refresh_token_expires_at: number;

      user: User;
      error: string;
    }
  }