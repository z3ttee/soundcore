import { Controller, Get, Query } from '@nestjs/common';
import { Pageable, Pagination } from 'nestjs-pager';
import { Authentication } from '../authentication/decorators/authentication.decorator';
import { User } from '../user/entities/user.entity';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get("playlists")
  public async searchPlaylists(@Query("q") query: string, @Pagination() pageable: Pageable, @Authentication() authentication: User) {
    return this.service.searchPlaylists(query, pageable, authentication);
  }

  @Get("users")
  public async searchUsers(@Query("q") query: string, @Pagination() pageable: Pageable) {
    return this.service.searchUsers(query, pageable);
  }

  @Get("artists")
  public async searchArtists(@Query("q") query: string, @Pagination() pageable: Pageable) {
    return this.service.searchArtists(query, pageable);
  }

  @Get("albums")
  public async searchAlbums(@Query("q") query: string, @Pagination() pageable: Pageable) {
    return this.service.searchAlbums(query, pageable);
  }

  @Get("songs")
  public async searchSongs(@Query("q") query: string, @Pagination() pageable: Pageable) {
    return this.service.searchSongs(query, pageable);
  }

  @Get("labels")
  public async searchLabels(@Query("q") query: string, @Pagination() pageable: Pageable) {
    return this.service.searchLabels(query, pageable);
  }

  @Get("publishers")
  public async searchPublishers(@Query("q") query: string, @Pagination() pageable: Pageable) {
    return this.service.searchPublishers(query, pageable);
  }

  @Get("distributors")
  public async searchDistributors(@Query("q") query: string, @Pagination() pageable: Pageable) {
    return this.service.searchDistributors(query, pageable);
  }
}
