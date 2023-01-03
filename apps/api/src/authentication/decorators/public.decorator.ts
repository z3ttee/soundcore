import { applyDecorators, SetMetadata } from "@nestjs/common";
import { OIDC_AUTH_OPTIONAL, OIDC_AUTH_SKIP } from "../oidc.constants";

/**
 * Mark a route as public. You can also define,
 * if the authentication should be skipped entirely.
 * @param skipAuth Skip authentication entirely or try to authenticate request. (Can result in @Authentication to be null)
 */
export const Public = ((skipAuth = false) => {
    return applyDecorators(
        SetMetadata(OIDC_AUTH_OPTIONAL, true),
        SetMetadata(OIDC_AUTH_SKIP, skipAuth)
    );
})