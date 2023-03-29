import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Pageable, Pagination } from '@soundcore/common';
import { Authentication } from '../../authentication/decorators/authentication.decorator';

import { User } from '../../user/entities/user.entity';
import { CreateImportDTO } from '../dtos/create-import.dto';
import { ImportTaskStatus, ImportTaskType } from '../entities/import.entity';
import { ImportReportService } from '../services/import-report.service';
import { ImportService } from '../services/import.service';
import { SpotifyImportService } from '../services/spotify.service';

@Controller('imports')
export class ImportController {
  constructor(
    private readonly importService: ImportService,
    private readonly reportService: ImportReportService,
    private readonly spotifyService: SpotifyImportService
  ) {}

  @Get("spotify")
  public async findPendingSpotifyByUserId(@Authentication() authentication: User, @Pagination() pageable: Pageable) {
    return this.importService.findByStatusOfUser(authentication.id, [ ImportTaskStatus.ENQUEUED, ImportTaskStatus.PROCESSING ], ImportTaskType.SPOTIFY_PLAYLIST, pageable);
  }

  @Get("spotify/completed")
  public async findCompletedSpotifyByUserId(@Authentication() authentication: User, @Pagination() pageable: Pageable) {
    return this.importService.findByStatusOfUser(authentication.id, [ ImportTaskStatus.OK ], ImportTaskType.SPOTIFY_PLAYLIST, pageable);
  }

  @Get("spotify/failed")
  public async findFailedSpotifyByUserId(@Authentication() authentication: User, @Pagination() pageable: Pageable) {
    return this.importService.findByStatusOfUser(authentication.id, [ ImportTaskStatus.ERRORED, ImportTaskStatus.SERVER_ABORT ], ImportTaskType.SPOTIFY_PLAYLIST, pageable);
  }

  @Post("spotify/playlist")
  public async createSpotifyImport(@Body() createImportDto: CreateImportDTO, @Authentication() importer: User) {
    return this.spotifyService.createPlaylistImport(createImportDto, importer);
  }

  @Get(":taskId/report")
  public async findReportByTaskId(@Param("taskId") taskId: string, @Authentication() authentication: User) {
    return this.reportService.findByTaskId(taskId, authentication);
  }

  @Delete(":taskId")
  public async deleteById(@Param("taskId") taskId: string, @Authentication() authentication: User) {
    return this.importService.deleteById(taskId, authentication);
  }
}
