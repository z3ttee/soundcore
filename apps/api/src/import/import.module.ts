import { Module } from '@nestjs/common';
import { ImportService } from './services/import.service';
import { ImportController } from './controllers/import.controller';
import { SpotifyImportService } from './services/spotify.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportTask } from './entities/import.entity';

@Module({
  controllers: [ImportController],
  providers: [
    ImportService,
    SpotifyImportService,
  ],
  imports: [
    TypeOrmModule.forFeature([ ImportTask ])
  ]
})
export class ImportModule {}
