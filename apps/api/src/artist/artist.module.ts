import { Module, OnModuleInit } from '@nestjs/common';
import { ArtistService } from './services/artist.service';
import { ArtistController } from './artist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeniusModule } from '../genius/genius.module';
import { Artist } from './entities/artist.entity';
import { InjectIndex, MeiliIndex, MeilisearchModule } from '@soundcore/meilisearch';

@Module({
  controllers: [ArtistController],
  providers: [ArtistService],
  imports: [
    GeniusModule,
    TypeOrmModule.forFeature([ Artist ]),
    MeilisearchModule.forFeature([ Artist ])
  ],
  exports: [
    ArtistService
  ]
})
export class ArtistModule implements OnModuleInit {

  constructor(
    @InjectIndex(Artist) private readonly artistIndex: MeiliIndex<Artist>
  ) {}

  onModuleInit() {
      
  }

}
