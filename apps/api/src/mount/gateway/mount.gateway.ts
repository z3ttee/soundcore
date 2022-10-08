import { WebSocketGateway } from '@nestjs/websockets';
import { AuthGateway } from '../../utils/gateway/auth-gateway';
import { Mount } from '../entities/mount.entity';

const MOUNT_EVENT_PROGRESS = "mount-progress-event";

@WebSocketGateway()
export class MountGateway extends AuthGateway {
  
  /**
   * This will send an update event to all
   * connected socket clients.
   * @param mount Updated mount data.
   * @param progress Optional progress.
   * @returns boolean
   */
  public async sendMountUpdateEvent(mount: Mount, progress?: number) {
    return this.server.sockets.emit(MOUNT_EVENT_PROGRESS, mount, progress);
  }

}
