import { Module, OnModuleInit } from '@nestjs/common';
import { ImportService } from './services/import.service';
import { ImportController } from './controllers/import.controller';
import { SpotifyImportService } from './services/spotify.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportTask } from './entities/import.entity';
import { JanitorModule } from '../janitor/janitor.module';
import { JanitorService } from '../janitor/services/janitor.service';
import { filter } from 'rxjs';

@Module({
  controllers: [ImportController],
  providers: [
    ImportService,
    SpotifyImportService,
  ],
  imports: [
    JanitorModule,
    TypeOrmModule.forFeature([ ImportTask ])
  ]
})
export class ImportModule implements OnModuleInit {

  constructor(
    private readonly janitor: JanitorService
  ) {}

  public async onModuleInit() {
    this.janitor.clearOngoingImports();
  }

}
