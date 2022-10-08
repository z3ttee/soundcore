import path from 'path';
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MountService } from './services/mount.service'
import { MountController } from './controllers/mount.controller';
import { MountGateway } from './gateway/mount.gateway';
import { Mount } from './entities/mount.entity';
import { MountQueueService } from './services/mount-queue.service';
import { WorkerQueueModule } from '@soundcore/nest-queue';

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
    WorkerQueueModule.forFeature({
      script: path.join(__dirname, "worker", "mount.worker.js"),
      concurrent: 2
    })
  ],
  exports: [
    MountService
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
