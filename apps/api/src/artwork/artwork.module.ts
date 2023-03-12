import path from 'path';
import { Module, OnModuleInit } from '@nestjs/common';
import { ArtworkController } from './controllers/artwork.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkService } from './services/artwork.service';
import { AlbumArtwork, ArtistArtwork, Artwork, DownloadableArtwork, SongArtwork } from './entities/artwork.entity';
import { PipelineModule } from '@soundcore/pipelines';
import { ScheduleModule } from '@nestjs/schedule';
import { ArtworkBackgroundService } from './services/background.service';

@Module({
  controllers: [ArtworkController],
  providers: [
    ArtworkService,
    ArtworkBackgroundService
  ],
  imports: [
    ScheduleModule,
    TypeOrmModule.forFeature([ 
      Artwork, 
      SongArtwork, 
      AlbumArtwork, 
      ArtistArtwork, 
      DownloadableArtwork 
    ]),
    PipelineModule.registerPipelines({
      pipelines: [
        path.join(__dirname, "pipelines", "artwork.pipeline.js")
      ]
    })
  ],
  exports: [
    ArtworkService
  ]
})
export class ArtworkModule implements OnModuleInit {

  constructor(
    private readonly backgroundService: ArtworkBackgroundService
  ) {}

  public async onModuleInit() {
    return this.backgroundService.markAwaitingAsAborted();
  }

}
