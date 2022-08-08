import { InjectQueue } from '@nestjs/bull';
import { WebSocketGateway } from '@nestjs/websockets';
import { Queue } from 'bull';
import { Socket } from 'socket.io';
import { OIDCService } from '../../authentication/services/oidc.service';
import { QUEUE_MOUNTSCAN_NAME } from '../../constants';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';
import { AuthGateway } from '../../utils/gateway/auth-gateway';
import { MountScanProcessDTO } from '../dtos/mount-scan.dto';
import { Mount } from '../entities/mount.entity';
import { MountService } from '../services/mount.service';
import { ProgressInfoDTO } from '../worker/progress-info.dto';

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
  public async sendMountUpdateEvent(mount: Mount, progress?: ProgressInfoDTO) {
    return this.server.sockets.emit(MOUNT_EVENT_PROGRESS, mount, progress);
  }

}
