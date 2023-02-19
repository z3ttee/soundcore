import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MountService } from './services/mount.service'
import { MountController } from './controllers/mount.controller';
import { Mount } from './entities/mount.entity';
import { MountQueueService } from './services/mount-queue.service';
import { MountRegistryService } from './services/mount-registry.service';
import { GatewayModule } from '../gateway/gateway.module';
import { IndexerModule } from '../indexer/indexer.module';
import { Environment } from '@soundcore/common';

@Module({
  controllers: [
    MountController
  ],
  providers: [
    MountService,
    MountQueueService,
    MountRegistryService
  ],
  imports: [
    TypeOrmModule.forFeature([ Mount ]),
    GatewayModule,
    IndexerModule
  ],
  exports: [
    MountService,
    MountRegistryService
  ]
})
export class MountModule implements OnModuleInit {
  private readonly logger = new Logger(MountModule.name);

  constructor(
    private readonly service: MountService,
  ) {}

  public async onModuleInit() {
    return this.service.checkForDefaultMount().then((result) => {
      if(Environment.isDockerized) {
        return this.service.checkMountsDockerMode();
      } else {
        return this.service.checkMountsStandaloneMode();
      }
    }).catch((error: Error) => {
      if(Environment.isDebug) {
        this.logger.error(`Error occured while checking mounts: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Error occured while checking mounts: ${error.message}`);
      }
    });
  }

}
