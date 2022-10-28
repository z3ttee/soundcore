import { WebSocketGateway } from "@nestjs/websockets";
import { AuthGateway } from "../../utils/gateway/auth-gateway";

@WebSocketGateway()
export class GeneralGateway extends AuthGateway {

    protected async canAccessGateway(roles: string[]): Promise<boolean> {
        return true;
    }

}