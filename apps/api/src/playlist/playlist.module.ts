import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SongModule } from '../song/song.module';
import { ArtworkModule } from '../artwork/artwork.module';
import { Playlist } from './entities/playlist.entity';
import { PlaylistItem } from './entities/playlist-item.entity';

@Module({
  controllers: [PlaylistController],
  providers: [PlaylistService],
  imports: [
    SongModule,
    ArtworkModule,
    TypeOrmModule.forFeature([ Playlist, PlaylistItem ])
  ],
  exports: [
    PlaylistService
  ]
})
export class PlaylistModule {}
