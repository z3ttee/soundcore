import { Module } from '@nestjs/common';
import { SongController } from './controllers/song.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistModule } from '../artist/artist.module';
import { GeniusModule } from '../genius/genius.module';
import { PublisherModule } from '../publisher/publisher.module';
import { LabelModule } from '../label/label.module';
import { AlbumModule } from '../album/album.module';
import { ArtworkModule } from '../artwork/artwork.module';
import { Song } from './entities/song.entity';
import { PlaylistItem } from '../playlist/entities/playlist-item.entity';
import { SongService } from './services/song.service';

@Module({
  controllers: [
    SongController
  ],
  providers: [
    SongService
  ],
  imports: [
    GeniusModule,
    ArtistModule,
    PublisherModule,
    LabelModule,
    AlbumModule,
    ArtworkModule,
    TypeOrmModule.forFeature([ Song, PlaylistItem ])
  ],
  exports: [
    SongService
  ]
})
export class SongModule {}
