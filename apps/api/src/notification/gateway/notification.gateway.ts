import { WebSocketGateway } from "@nestjs/websockets";
import { UserService } from "../../user/user.service";
import { AuthGateway } from "../../utils/gateway/auth-gateway";
import { Notification } from "../entities/notification.entity";

export const NOTIFICATION_EVENT_PUSH = "notification:push";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
  path: "/notifications",
})
export class NotificationGateway extends AuthGateway {
  constructor(userService: UserService) {
    super(userService);
  }

  public async sendNotification(notification: Notification) {
    if (notification.isBroadcast) {
      this.server.emit(NOTIFICATION_EVENT_PUSH, notification);
    } else {
      for (const target of notification.targets) {
        const socket = this.getAuthenticatedSocket(target.id);
        socket?.emit(NOTIFICATION_EVENT_PUSH, notification);
      }
    }
  }

  protected async canAccessGateway(roles: string[]): Promise<boolean> {
    return true;
  }
}
