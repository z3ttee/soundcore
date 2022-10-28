import { Controller, Get, Param, Query } from '@nestjs/common';
import { Pageable, Pagination } from 'nestjs-pager';
import { Authentication } from '../../authentication/decorators/authentication.decorator';
import { User } from '../../user/entities/user.entity';
import { AlbumService } from '../album.service';

@Controller('albums')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get("/byArtist/:artistId")
  public async findProfilesByArtist(@Param("artistId") artistId: string, @Pagination() pageable: Pageable, @Authentication() authentication: User) {
    return this.albumService.findByArtist(artistId, pageable, authentication);
  }

  @Get("/byArtist/:artistId/recommended")
  public async findRecommendedProfilesByArtist(@Param("artistId") artistId: string, @Query("except") exceptAlbumIds: string[], @Authentication() authentication: User) {
    return this.albumService.findRecommendedProfilesByArtist(artistId, exceptAlbumIds, authentication);
  }

  @Get("/byFeaturedArtist/:artistId")
  public async findByFeaturedArtist(@Param("artistId") artistId: string, @Pagination() pageable: Pageable, @Authentication() authentication: User) {
    return this.albumService.findFeaturedWithArtist(artistId, pageable, authentication);
  }

  @Get("/byGenre/:genreId")
  public async findByGenre(@Param("genreId") genreId: string, @Pagination() pageable: Pageable, @Authentication() authentication: User) {
    return this.albumService.findByGenre(genreId, pageable, authentication);
  }

  @Get(":albumId")
  public async findProfileById(@Param("albumId") albumId: string, @Authentication() authentication: User) {
    return this.albumService.findById(albumId, authentication);
  }

}
