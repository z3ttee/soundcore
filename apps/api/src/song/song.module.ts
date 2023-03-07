import { Module } from '@nestjs/common';
import { SongController } from './controllers/song.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistModule } from '../artist/artist.module';
import { GeniusModule } from '../genius/genius.module';
import { PublisherModule } from '../publisher/publisher.module';
import { LabelModule } from '../label/label.module';
import { AlbumModule } from '../album/album.module';
import { ArtworkModule } from '../artwork/artwork.module';
import { Song, SongIndex } from './entities/song.entity';
import { PlaylistItem } from '../playlist/entities/playlist-item.entity';
import { SongService } from './services/song.service';
import { MeilisearchModule } from '@soundcore/meilisearch';
import { SongMeiliService } from './services/song-meili.service';

@Module({
  controllers: [
    SongController
  ],
  providers: [
    SongService,
    SongMeiliService
  ],
  imports: [
    GeniusModule,
    ArtistModule,
    PublisherModule,
    LabelModule,
    AlbumModule,
    ArtworkModule,
    TypeOrmModule.forFeature([ Song, PlaylistItem ]),
    MeilisearchModule.forFeature([ SongIndex ])
  ],
  exports: [
    SongService,
    SongMeiliService
  ]
})
export class SongModule {}
