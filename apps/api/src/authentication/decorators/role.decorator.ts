import { applyDecorators, SetMetadata } from "@nestjs/common";
import { OIDC_AUTH_ROLES } from "../oidc.constants";

/**
 * Requires users to have a specific role before accessing the route.
 * @param roles List of allowed roles
 */
export const Roles = ((...roles: string[]) => {
    return applyDecorators(
        SetMetadata(OIDC_AUTH_ROLES, roles)
    );
})