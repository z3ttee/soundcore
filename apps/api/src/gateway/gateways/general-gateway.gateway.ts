import { WebSocketGateway } from "@nestjs/websockets";
import { UserService } from "../../user/user.service";
import { AuthGateway } from "../../utils/gateway/auth-gateway";
import { GatewayEvent } from "../events/gateway-event";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
  path: "/general",
  transports: ["websocket", "polling"],
})
export class GeneralGateway extends AuthGateway {
  constructor(userService: UserService) {
    super(userService);
  }

  protected async canAccessGateway(roles: string[]): Promise<boolean> {
    return true;
  }

  public async sendEventToUser(userId: string, event: GatewayEvent) {
    this.getAuthenticatedSocket(userId)?.emit(event.name, event);
  }

  public async broadcastEvent(event: GatewayEvent) {
    this.server.emit(event.name, event);
  }
}
