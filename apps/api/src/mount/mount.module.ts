import path from 'path';
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MountService } from './services/mount.service'
import { MountController } from './controllers/mount.controller';
import { MountGateway } from './gateway/mount.gateway';
import { Mount } from './entities/mount.entity';
import { MountQueueService } from './services/mount-queue.service';
import { WorkerQueueModule } from '@soundcore/nest-queue';
import { MountRegistryService } from './services/mount-registry.service';

@Module({
  controllers: [
    MountController
  ],
  providers: [
    MountService,
    MountGateway,
    MountQueueService,
    MountRegistryService
  ],
  imports: [
    TypeOrmModule.forFeature([ Mount ]),
    WorkerQueueModule.forFeature({
      script: path.join(__dirname, "worker", "mount.worker.js"),
      concurrent: 2
    })
  ],
  exports: [
    MountService,
    MountRegistryService
  ]
})
export class MountModule implements OnModuleInit {

  constructor(
    private readonly service: MountService,
  ) {}

  public async onModuleInit() {
    return this.service.checkForDefaultMount().then(() => {
      return this.service.checkMounts();
    });
  }

}
