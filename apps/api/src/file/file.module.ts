import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerQueueModule } from '@soundcore/nest-queue';
import path from 'path';
import { IndexerModule } from '../indexer/indexer.module';
import { JanitorService } from '../janitor/services/janitor.service';
import { FileController } from './controllers/file.controller';
import { File } from './entities/file.entity';
import { FileQueueService } from './services/file-queue.service';
import { FileService } from './services/file.service';

@Module({
  controllers: [
    FileController
  ],
  providers: [
    FileService,
    FileQueueService
  ],
  imports: [
    IndexerModule,
    TypeOrmModule.forFeature([ File ]),
    WorkerQueueModule.forFeature({
      script: path.join(__dirname, "worker", "file.worker.js"),
      concurrent: 4
    })
  ],
  exports: [
    FileService
  ]
})
export class FileModule implements OnModuleInit {
  constructor(private readonly queue: FileQueueService) {}

  public async onModuleInit() {
    await this.queue.processAwaitingFiles();
  }
  
}
