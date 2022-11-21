import path from 'node:path';
import { Module, OnModuleInit } from '@nestjs/common';
import { ImportService } from './services/import.service';
import { ImportController } from './controllers/import.controller';
import { SpotifyImportService } from './services/spotify.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportTask } from './entities/import.entity';
import { JanitorModule } from '../janitor/janitor.module';
import { JanitorService } from '../janitor/services/janitor.service';
import { WorkerQueueModule } from '@soundcore/nest-queue';
import { ImportQueueService } from './services/import-queue.service';
import { GatewayModule } from '../gateway/gateway.module';
import { ImportReport } from './entities/import-report.entity';

@Module({
  controllers: [ImportController],
  providers: [
    ImportService,
    ImportQueueService,
    SpotifyImportService,
  ],
  imports: [
    JanitorModule,
    GatewayModule,
    TypeOrmModule.forFeature([ ImportTask, ImportReport ]),
    WorkerQueueModule.forFeature({
      script: path.join(__dirname, "worker", "import.worker.js"),
      concurrent: 4,
      workerType: "thread"
    })
  ]
})
export class ImportModule implements OnModuleInit {

  constructor(
    private readonly janitor: JanitorService
  ) {}

  public async onModuleInit() {
    this.janitor.clearOngoingImports();
    this.janitor.clearOldImports();
  }

}
