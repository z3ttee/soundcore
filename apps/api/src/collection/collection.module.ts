import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaylistModule } from '../playlist/playlist.module';
import { CollectionController } from './controller/collection.controller';
import { LibraryController } from './controller/library.controller';
import { LikeController } from './controller/like.controller';
import { LikedAlbum, LikedPlaylist, LikedResource, LikedSong } from './entities/like.entity';
import { CollectionService } from './services/collection.service';
import { LibraryService } from './services/library.service';
import { LikeService } from './services/like.service';

@Module({
  controllers: [
    CollectionController,
    LikeController,
    LibraryController
  ],
  providers: [
    CollectionService,
    LikeService,
    LibraryService
  ],
  imports: [
    PlaylistModule,
    TypeOrmModule.forFeature([ LikedResource, LikedSong, LikedAlbum, LikedPlaylist ])
  ],
  exports: [
    LikeService
  ]
})
export class CollectionModule {}
