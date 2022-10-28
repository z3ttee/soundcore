import { Module } from '@nestjs/common';
import { LabelService } from './services/label.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkModule } from '../artwork/artwork.module';
import { LabelController } from './controllers/label.controller';
import { Label } from './entities/label.entity';

@Module({
  controllers: [LabelController],
  providers: [LabelService],
  imports: [
    ArtworkModule,
    TypeOrmModule.forFeature([ Label ])
  ],
  exports: [
    LabelService
  ]
})
export class LabelModule {}
