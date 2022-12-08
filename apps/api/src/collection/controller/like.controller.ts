import { Controller, Get, Param, Put } from '@nestjs/common';
import { Pageable, Pagination } from 'nestjs-pager';
import { Authentication } from '../../authentication/decorators/authentication.decorator';
import { User } from '../../user/entities/user.entity';
import { LikeService } from '../services/like.service';

@Controller('likes')
export class LikeController {

  constructor(private readonly likeService: LikeService) {}

  @Get("/songs")
  public async findPageByLikedSongsOfUser(@Authentication() user: User, @Pagination() pageable: Pageable) {
    return this.likeService.findPageByLikedSongsOfUser(user.id, pageable);
  }

  @Put("/songs/:songId")
  public async likeSong(@Param("songId") songId: string, @Authentication() user: User): Promise<boolean> {
    return this.likeService.toggleLikeForSong(songId, user);
  }

  @Put("/playlists/:playlistId")
  public async likePlaylist(@Param("playlistId") playlistId: string, @Authentication() user: User): Promise<boolean> {
    return this.likeService.toggleLikeForPlaylist(playlistId, user)
  }

  @Put("/albums/:albumId")
  public async likeAlbum(@Param("albumId") albumId: string, @Authentication() user: User): Promise<boolean> {
    return this.likeService.toggleLikeForAlbum(albumId, user)
  }

}
