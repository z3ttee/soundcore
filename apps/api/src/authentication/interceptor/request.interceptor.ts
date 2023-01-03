import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { UserService } from "../../user/user.service";
import { KeycloakTokenPayload } from "../entities/oidc-token.entity";
import { OIDC_REQUEST_MAPPING } from "../oidc.constants";

@Injectable()
export class RequestInterceptor implements NestInterceptor {

    constructor(
        private userService: UserService
    ) {}
    
    public async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        const request = context.switchToHttp()?.getRequest();
        // TODO: Support not only keycloak
        const authentication: KeycloakTokenPayload = request[OIDC_REQUEST_MAPPING];

        if(authentication) {
            request[OIDC_REQUEST_MAPPING] = await this.userService.findOrCreateByTokenPayload(authentication)
        }

        return next.handle()
    }

}