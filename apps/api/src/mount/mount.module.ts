import path from 'path';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MountService } from './services/mount.service'
import { MountController } from './controllers/mount.controller';
import { Mount } from './entities/mount.entity';
import { MountQueueService } from './services/mount-queue.service';
import { WorkerQueueModule } from '@soundcore/nest-queue';
import { MountRegistryService } from './services/mount-registry.service';
import { GatewayModule } from '../gateway/gateway.module';
import { Environment } from '@soundcore/common';
import { PipelineModule } from '@soundcore/worker';

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
    WorkerQueueModule.forFeature({
      script: path.join(__dirname, "worker", "mount.worker.js"),
      concurrent: 2
    }),
    PipelineModule.registerPipelines({
      concurrent: 2,
      disableLogging: process.env.PRODUCTION == "false"
    },[
      { 
        id: "scan-pipeline", 
        name: "Mount Scan", 
        stages: [
          { 
            id: "test", 
            name: "Test 1", 
            scriptPath: path.join(__dirname, "pipeline", "scan.pipeline.js"),
            steps: [
              { id: "123", name: "Test Step 1" }
            ]
          }
        ]
      }
    ]),
    GatewayModule,
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
      this.service.pipelineService.enqueue("scan-pipeline").then(() => console.log("dispatched"));

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
