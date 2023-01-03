import { forwardRef, Module } from '@nestjs/common';
import { AlbumService } from './services/album.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeniusModule } from '../genius/genius.module';
import { AlbumController } from './controllers/album.controller';
import { Album } from './entities/album.entity';

@Module({
  controllers: [AlbumController],
  providers: [AlbumService],
  imports: [
    forwardRef(() => GeniusModule),
    TypeOrmModule.forFeature([ Album ])
  ],
  exports: [
    AlbumService
  ]
})
export class AlbumModule {}
