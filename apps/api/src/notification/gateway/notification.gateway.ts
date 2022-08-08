import { WebSocketGateway } from '@nestjs/websockets';
import { OIDCService } from '../../authentication/services/oidc.service';
import { UserService } from '../../user/user.service';
import { AuthGateway } from '../../utils/gateway/auth-gateway';
import { Notification } from '../entities/notification.entity';

export const NOTIFICATION_EVENT_PUSH = "notification:push";

@WebSocketGateway({
  cors: {
    origin: "*"
  },
  path: "/notifications"
})
export class NotificationGateway extends AuthGateway {

  constructor(userService: UserService, oidcService: OIDCService) {
    super(userService, oidcService);
  }

  public async sendNotification(notification: Notification) {
    if(notification.isBroadcast) {
      this.server.emit(NOTIFICATION_EVENT_PUSH, notification);
    } else {
      for(const target of notification.targets) {
        const socket = this.getAuthenticatedSocket(target.id);
        socket?.emit(NOTIFICATION_EVENT_PUSH, notification);
      }
    }
  }
  
}
