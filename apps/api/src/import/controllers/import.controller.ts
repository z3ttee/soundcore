import { Body, Controller, Post } from '@nestjs/common';
import { Authentication } from '../../authentication/decorators/authentication.decorator';

import { User } from '../../user/entities/user.entity';
import { CreateImportDTO } from '../dtos/create-import.dto';
import { ImportService } from '../services/import.service';
import { SpotifyImportService } from '../services/spotify.service';

@Controller('imports')
export class ImportController {
  constructor(
    private readonly importService: ImportService,
    private readonly spotifyService: SpotifyImportService
  ) {}

  // @Post()
  // public async createImport(@Body() createImportDto: CreateImportDTO, @Authentication() importer: User) {
  //   return this.importService.createImport(createImportDto, importer);
  // }

  @Post("spotify/playlist")
  public async createSpotifyImport(@Body() createImportDto: CreateImportDTO, @Authentication() importer: User) {
    return this.spotifyService.createPlaylistImport(createImportDto, importer);
  }
}
