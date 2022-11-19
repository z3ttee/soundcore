import { Body, Controller, Get, Post } from '@nestjs/common';
import { Pageable, Pagination } from 'nestjs-pager';
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

  @Get()
  public async findAllByUserId(@Authentication() authentication: User, @Pagination() pageable: Pageable) {
    return this.importService.findAllByUser(authentication.id, pageable);
  }

  @Post("spotify/playlist")
  public async createSpotifyImport(@Body() createImportDto: CreateImportDTO, @Authentication() importer: User) {
    return this.spotifyService.createPlaylistImport(createImportDto, importer);
  }
}
