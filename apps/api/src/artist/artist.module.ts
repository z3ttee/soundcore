import { Module } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { ArtistController } from './artist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeniusModule } from '../genius/genius.module';
import { Artist } from './entities/artist.entity';

@Module({
  controllers: [ArtistController],
  providers: [ArtistService],
  imports: [
    GeniusModule,
    TypeOrmModule.forFeature([ Artist ])
  ],
  exports: [
    ArtistService
  ]
})
export class ArtistModule {}
