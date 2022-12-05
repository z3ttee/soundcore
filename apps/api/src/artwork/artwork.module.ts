import { Module } from '@nestjs/common';
import { ArtworkController } from './controllers/artwork.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkService } from './services/artwork.service';
import { Artwork } from './entities/artwork.entity';
import { WorkerQueueModule } from '@soundcore/nest-queue';
import path from 'path';
import { ArtworkColorInfo } from './entities/artwork-color-info.entity';
import { ArtworkQueueService } from './services/artwork-queue.service';

@Module({
  controllers: [ArtworkController],
  providers: [
    ArtworkService,
    ArtworkQueueService
  ],
  imports: [
    TypeOrmModule.forFeature([ Artwork, ArtworkColorInfo ]),
    WorkerQueueModule.forFeature({
      script: path.join(__dirname, "worker", "artwork.worker.js"),
      concurrent: 4
    })
  ],
  exports: [
    ArtworkService
  ]
})
export class ArtworkModule {}
