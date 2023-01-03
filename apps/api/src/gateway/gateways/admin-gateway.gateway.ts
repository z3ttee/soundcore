import { WebSocketGateway } from "@nestjs/websockets";
import { Mount } from "../../mount/entities/mount.entity";
import { AuthGateway } from "../../utils/gateway/auth-gateway";

import { GATEWAY_MOUNT_UPDATE } from "@soundcore/constants";
import { UserService } from "../../user/user.service";
import { OIDCService } from "../../authentication/services/oidc.service";
import { MountStatusUpdateEvent } from "../events/mount-status-update.event";

@WebSocketGateway({
    cors: {
      origin: "*"
    },
    path: "/admin"
})
export class AdminGateway extends AuthGateway {

  constructor(userService: UserService, oidcService: OIDCService) {
    super(userService, oidcService);
  }
  
    /**
     * This will send an update event to all
     * connected socket clients.
     * @param mount Updated mount data.
     * @param progress Optional progress.
     * @returns boolean
     */
    public async sendMountStatusUpdate(mount: Mount, progress?: number) {
        return this.server.sockets.emit(GATEWAY_MOUNT_UPDATE, new MountStatusUpdateEvent(mount.id, mount.status, progress));
    }

    protected async canAccessGateway(roles: string[]): Promise<boolean> {
        return roles.includes("admin");
    }

}