import { forwardRef, Module } from '@nestjs/common';
import { AlbumService } from './services/album.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeniusModule } from '../genius/genius.module';
import { AlbumController } from './controllers/album.controller';
import { Album, AlbumIndex } from './entities/album.entity';
import { MeilisearchModule } from '@soundcore/meilisearch';
import { AlbumMeiliService } from './services/album-meili.service';

@Module({
  controllers: [AlbumController],
  providers: [
    AlbumService,
    AlbumMeiliService
  ],
  imports: [
    forwardRef(() => GeniusModule),
    TypeOrmModule.forFeature([ Album ]),
    MeilisearchModule.forFeature([ AlbumIndex ])
  ],
  exports: [
    AlbumService,
    AlbumMeiliService
  ]
})
export class AlbumModule {}
