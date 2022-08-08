import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import path from 'path';
import { QUEUE_FILE_NAME } from '../constants';
import { IndexerModule } from '../indexer/indexer.module';
import { FileController } from './controllers/file.controller';
import { File } from './entities/file.entity';
import { FileService } from './services/file.service';

@Module({
  controllers: [
    FileController
  ],
  providers: [
    FileService
  ],
  imports: [
    IndexerModule,
    TypeOrmModule.forFeature([ File ]),
    BullModule.registerQueue({
      name: QUEUE_FILE_NAME,
      processors: [
        { 
          path: path.join(__dirname, "worker", "file.worker.js"), 
          concurrency: 1
        }
      ],
      defaultJobOptions: {
        removeOnFail: true,
        removeOnComplete: true
      }
    })
  ],
  exports: [
    FileService
  ]
})
export class FileModule {}
