import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { OIDC_AUTH_OPTIONAL, OIDC_AUTH_ROLES, OIDC_AUTH_SKIP, OIDC_REQUEST_MAPPING } from "../oidc.constants";
import { OIDCService } from "../services/oidc.service";

@Injectable()
export class OIDCGuard implements CanActivate {
    private readonly logger: Logger = new Logger(OIDCGuard.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly service: OIDCService,
        private readonly reflector: Reflector,
    ) {}

    public async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const context = ctx.switchToHttp();
        if(!context) throw new ForbiddenException("Invalid guard context.");

        const isAuthOptional = this.reflector.get<boolean>(OIDC_AUTH_OPTIONAL, ctx.getHandler()) || false;
        const skipAuth = this.reflector.get<boolean>(OIDC_AUTH_SKIP, ctx.getHandler()) || false;
        if(skipAuth) return true;

        const request: Request = context.getRequest();
        const authHeader: string = request.headers.authorization;

        const tokenValue = authHeader?.slice("Bearer ".length);

        return this.service.verifyAccessToken(tokenValue).then((token) => {
            const allowedRoles = this.reflector.get<string[]>(OIDC_AUTH_ROLES, ctx.getHandler()) || [];
            const roles = token?.["realm_access"]?.["roles"] || [];

            if(!this.hasRequiredRole(allowedRoles, roles) && allowedRoles.length > 0 ) {
                throw new ForbiddenException("You do not have the required role to perform this action.")
            }

            request[OIDC_REQUEST_MAPPING] = token;
            return isAuthOptional || true
        }).catch((error) => {
            if(isAuthOptional) return true;

            if(error instanceof ForbiddenException || error instanceof UnauthorizedException) {
                throw error;
            } else {
                this.logger.warn(`Blocked request on guarded route '${request.path}': ${error?.message}`);
                throw new UnauthorizedException("Failed checking your identity at the register issuer.");
            }
        })
    }

    private hasRequiredRole(haystack: string[], needles: string[]) {
        let hasAllowedRole = false;
        for(const r of haystack) {
            if(needles.includes(r)) {
                hasAllowedRole = true;
                break;
            }
        }

        return hasAllowedRole;
    }

}