import NextAuth from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak";

export default NextAuth({
    callbacks: {
        session: async (params) => {
            const { session, token, user } = params;
            // Return type of session will be return type of useSession() hook

            return session;
        }
    },
    providers: [
        KeycloakProvider({
            clientId: `${process.env.KEYCLOAK_CLIENT_ID}`,
            clientSecret: `${process.env.KEYCLOAK_SECRET}`,
            issuer: process.env.KEYCLOAK_URL
        })
    ],
    pages: {
        signIn: "/auth/signin"
    }
})