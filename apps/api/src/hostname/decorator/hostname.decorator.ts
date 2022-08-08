import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { HOSTNAME_REQUEST_KEY } from "../hostname.module";

/**
 * Retrieve the hostname url.
 */
export const Hostname = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request[HOSTNAME_REQUEST_KEY];
})