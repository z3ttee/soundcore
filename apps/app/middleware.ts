import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: (params) => {
            const { token, req } = params;
            const { nextUrl } = req;
            const isAuthorized = typeof token !== "undefined" && token != null;

            if(nextUrl.pathname.startsWith("/auth") || nextUrl.pathname.startsWith("/images") || nextUrl.pathname.startsWith("/favicon")) {
                return true;
            }

            return isAuthorized;
        }
    }
})