import { WebSocketGateway } from "@nestjs/websockets";
import { OIDCService } from "../../authentication/services/oidc.service";
import { UserService } from "../../user/user.service";
import { AuthGateway } from "../../utils/gateway/auth-gateway";

@WebSocketGateway({
    cors: {
      origin: "*"
    },
    path: "/general"
})
export class GeneralGateway extends AuthGateway {

    constructor(userService: UserService, oidcService: OIDCService) {
        super(userService, oidcService);
    }

    protected async canAccessGateway(roles: string[]): Promise<boolean> {
        return true;
    }

}