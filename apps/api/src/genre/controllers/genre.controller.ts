import { Controller, Get, Param } from '@nestjs/common';
import { Pageable, Pagination } from 'nestjs-pager';
import { GenreService } from '../services/genre.service';

@Controller('genres')
export class GenreController {
  constructor(private readonly service: GenreService) {}

  @Get("")
  public async findAll(@Pagination() pageable: Pageable) {
    return this.service.findAll(pageable);
  }

  @Get("/byArtist/:artistId")
  public async findGenreByArtist(@Param("artistId") artistId: string, @Pagination() pageable: Pageable) {
    return this.service.findByArtist(artistId, pageable);
  }

  @Get(":genreId")
  public async findGenreById(@Param("genreId") genreId: string) {
    return this.service.findById(genreId);
  }

  

}
