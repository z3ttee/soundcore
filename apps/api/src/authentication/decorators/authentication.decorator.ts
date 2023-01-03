import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { OIDC_REQUEST_MAPPING } from "../oidc.constants";

/**
 * Retrieve the authenticated user's data.
 */
export const Authentication = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request[OIDC_REQUEST_MAPPING];
})