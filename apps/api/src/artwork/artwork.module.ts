import { Module, OnModuleInit } from '@nestjs/common';
import { ArtworkController } from './controllers/artwork.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkService } from './services/artwork.service';
import { Artwork } from './entities/artwork.entity';
import { WorkerQueue, WorkerQueueModule } from '@soundcore/nest-queue';
import path from 'path';
import { ArtworkQueueService } from './services/artwork-queue.service';
import { ArtworkProcessDTO, ArtworkProcessFlag } from './dtos/artwork-process.dto';

@Module({
  controllers: [ArtworkController],
  providers: [
    ArtworkService,
    ArtworkQueueService
  ],
  imports: [
    TypeOrmModule.forFeature([ Artwork ]),
    WorkerQueueModule.forFeature({
      script: path.join(__dirname, "worker", "artwork.worker.js"),
      concurrent: 4
    })
  ],
  exports: [
    ArtworkService
  ]
})
export class ArtworkModule implements OnModuleInit {

  constructor(private readonly queue: WorkerQueue<ArtworkProcessDTO>) {}

  public async onModuleInit() {
      return this.queue.enqueue(<ArtworkProcessDTO>{
        flag: ArtworkProcessFlag.CONTINUE_PROCESSING,
        entities: [],
        sourceType: null
      });
  }

}
