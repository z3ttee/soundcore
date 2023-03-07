import { Module, OnModuleInit } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { ArtistController } from './artist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeniusModule } from '../genius/genius.module';
import { Artist, ArtistIndex } from './entities/artist.entity';
import { InjectIndex, MeiliIndex, MeilisearchModule } from '@soundcore/meilisearch';

@Module({
  controllers: [ArtistController],
  providers: [ArtistService],
  imports: [
    GeniusModule,
    TypeOrmModule.forFeature([ Artist ]),
    MeilisearchModule.forFeature([ ArtistIndex ])
  ],
  exports: [
    ArtistService
  ]
})
export class ArtistModule implements OnModuleInit {

  constructor(
    @InjectIndex(ArtistIndex) private readonly artistIndex: MeiliIndex<ArtistIndex>
  ) {}

  onModuleInit() {
      this.artistIndex.addDocuments([
        {
          id: "123",
          name: "Artist",
          test: true
        }
      ])
  }

}
