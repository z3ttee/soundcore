import { WebSocketGateway } from "@nestjs/websockets";
import { Mount } from "../../mount/entities/mount.entity";
import { AuthGateway } from "../../utils/gateway/auth-gateway";

import { GATEWAY_MOUNT_UPDATE } from "@soundcore/constants";
import { MountUpdateEvent } from "../events/mount-update.event";

@WebSocketGateway({
    namespace: "admin"
})
export class AdminGateway extends AuthGateway {
  
    /**
     * This will send an update event to all
     * connected socket clients.
     * @param mount Updated mount data.
     * @param progress Optional progress.
     * @returns boolean
     */
    public async sendMountUpdate(mount: Mount, progress?: number) {
        return this.server.sockets.emit(GATEWAY_MOUNT_UPDATE, new MountUpdateEvent(mount, progress));
    }

    protected async canAccessGateway(roles: string[]): Promise<boolean> {
        return roles.includes("admin");
    }

}