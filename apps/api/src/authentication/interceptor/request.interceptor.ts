import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { UserService } from "../../user/user.service";
import { OIDCUser } from "../entities/oidc-user.entity";
import { OIDC_REQUEST_MAPPING } from "../oidc.constants";

@Injectable()
export class RequestInterceptor implements NestInterceptor {

    constructor(
        private userService: UserService
    ) {}
    
    public async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        const request = context.switchToHttp()?.getRequest();
        const authentication: OIDCUser = request[OIDC_REQUEST_MAPPING];

        if(authentication) {
            request[OIDC_REQUEST_MAPPING] = await this.userService.findOrCreateByKeycloakUserInstance(authentication)
        }

        return next.handle()
    }

}