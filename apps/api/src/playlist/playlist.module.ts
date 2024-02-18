import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SongModule } from '../song/song.module';
import { ArtworkModule } from '../artwork/artwork.module';
import { Playlist } from './entities/playlist.entity';
import { PlaylistItem } from './entities/playlist-item.entity';
import { PlaylistService } from './services/playlist.service';
import { PlaylistController } from './controllers/playlist.controller';
import { MeilisearchModule } from '@soundcore/meilisearch';
import { PlaylistMeiliService } from './services/playlist-meili.service';

@Module({
  controllers: [
    PlaylistController
  ],
  providers: [
    PlaylistService,
    PlaylistMeiliService
  ],
  imports: [
    SongModule,
    ArtworkModule,
    TypeOrmModule.forFeature([ Playlist, PlaylistItem ]),
    MeilisearchModule.forFeature([ Playlist ])
  ],
  exports: [
    PlaylistService,
    PlaylistMeiliService
  ]
})
export class PlaylistModule {}
