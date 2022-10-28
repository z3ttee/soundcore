import { Module } from '@nestjs/common';
import { DistributorController } from './controllers/distributor.controller';
import { ArtworkModule } from '../artwork/artwork.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributorService } from './services/distributor.service';
import { Distributor } from './entities/distributor.entity';

@Module({
  controllers: [DistributorController],
  providers: [DistributorService],
  exports: [
    DistributorService
  ],
  imports: [
    ArtworkModule,
    TypeOrmModule.forFeature([ Distributor ])
  ]
})
export class DistributorModule {}
