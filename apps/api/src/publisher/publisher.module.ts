import { Module } from '@nestjs/common';
import { PublisherController } from './controllers/publisher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkModule } from '../artwork/artwork.module';
import { PublisherService } from './services/publisher.service';
import { Publisher } from './entities/publisher.entity';

@Module({
  controllers: [PublisherController],
  providers: [PublisherService],
  imports: [
    ArtworkModule,
    TypeOrmModule.forFeature([ Publisher ])
  ],
  exports: [
    PublisherService
  ]
})
export class PublisherModule {}
