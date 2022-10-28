import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaylistModule } from '../playlist/playlist.module';
import { CollectionController } from './controller/collection.controller';
import { LikeController } from './controller/like.controller';
import { Like } from './entities/like.entity';
import { CollectionService } from './services/collection.service';
import { LikeService } from './services/like.service';

@Module({
  controllers: [
    CollectionController,
    LikeController
  ],
  providers: [
    CollectionService,
    LikeService
  ],
  imports: [
    PlaylistModule,
    TypeOrmModule.forFeature([ Like ])
  ]
})
export class CollectionModule {}
