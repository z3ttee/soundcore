import { Controller, Get, Param } from '@nestjs/common';
import { Page, Pageable, Pagination } from 'nestjs-pager';
import { Authentication } from '../../authentication/decorators/authentication.decorator';
import { User } from '../../user/entities/user.entity';
import { Song } from '../entities/song.entity';
import { SongService } from '../song.service';

@Controller('songs')
export class SongController {
  constructor(private readonly songService: SongService) {}

  @Get("latest")
  public async findLatest(@Authentication() user: User): Promise<Page<Song>> {
    return this.songService.findLatestPage(user);
  }

  @Get("oldest")
  public async findOldestRelease(@Authentication() user: User): Promise<Page<Song>> {
    return this.songService.findOldestReleasePage(user);
  }

  @Get("/byCollection")
  public async findByCollection(@Authentication() user: User, @Pagination() pageable: Pageable): Promise<Page<Song>> {
    return this.songService.findByCollectionAndOrArtist(user, pageable)
  }

  @Get("/byCollection/ids")
  public async findIdsByCollection(@Authentication() user: User): Promise<Page<Song>> {
    return this.songService.findIdsByCollection(user)
  }

  @Get("/byCollection/byArtist/:artistId")
  public async findByCollectionAndArtist(@Param("artistId") artistId: string, @Authentication() user: User, @Pagination() pageable: Pageable): Promise<Page<Song>> {
    return this.songService.findByCollectionAndOrArtist(user, pageable, artistId)
  }

  @Get("/byGenre/:genreId")
  public async findByGenre(@Param("genreId") genreId: string, @Pagination() pageable: Pageable, @Authentication() user: User): Promise<Page<Song>> {
    return this.songService.findByGenreAndOrArtist(genreId, undefined, pageable, user)
  }

  @Get("/byGenre/:genreId/byArtist/:artistId")
  public async findByGenreAndArtist(@Param("genreId") genreId: string, @Param("artistId") artistId: string, @Pagination() pageable: Pageable, @Authentication() user: User): Promise<Page<Song>> {
    return this.songService.findByGenreAndOrArtist(genreId, artistId, pageable, user)
  }

  @Get(":songId")
  public async findById(@Param("songId") songId: string, @Authentication() user: User): Promise<Song> {
    return this.songService.findById(songId, false, user);
  }

}
