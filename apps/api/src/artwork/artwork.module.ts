import { Module } from '@nestjs/common';
import { ArtworkController } from './artwork.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkService } from './services/artwork.service';
import { Artwork } from './entities/artwork.entity';

@Module({
  controllers: [ArtworkController],
  providers: [
    ArtworkService
  ],
  imports: [
    TypeOrmModule.forFeature([ Artwork ])
  ],
  exports: [
    ArtworkService
  ]
})
export class ArtworkModule {}
