import path from 'path';
import { BullModule } from '@nestjs/bull';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QUEUE_MOUNTSCAN_NAME } from '../constants';
import { MountService } from './services/mount.service'
import { MountController } from './controllers/mount.controller';
import { MountGateway } from './gateway/mount.gateway';
import { Mount } from './entities/mount.entity';
import { MountQueueService } from './services/mount-queue.service';

@Module({
  controllers: [
    MountController
  ],
  providers: [
    MountService,
    MountGateway,
    MountQueueService
  ],
  imports: [
    TypeOrmModule.forFeature([ Mount ]),
    BullModule.registerQueue({
      name: QUEUE_MOUNTSCAN_NAME,
      processors: [
        { 
          path: path.join(__dirname, "worker", "mount.worker.js"), 
          concurrency: parseInt(process.env.MAX_SCANNERS) || 4 
        }
      ],
      defaultJobOptions: {
        removeOnFail: true,
        removeOnComplete: true
      }
    })
  ],
  exports: [
    MountService
  ]
})
export class MountModule implements OnModuleInit {
  private readonly logger: Logger = new Logger(MountModule.name);

  constructor(
    private readonly service: MountService,
    private readonly queueService: MountQueueService
  ) {}

  public async onModuleInit() {
    return this.queueService.empty().then(() => {
      return this.service.checkForDefaultMount().then(() => {
        return this.service.checkMounts();
      });
    }).catch((error: Error) => {
      this.logger.error(`Error occured while initializing ${MountModule.name}: ${error.message}`, error.stack);
    });
  }

}
