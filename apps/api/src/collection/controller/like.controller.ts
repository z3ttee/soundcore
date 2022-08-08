import { Controller, Param, Post } from '@nestjs/common';
import { Authentication } from '../../authentication/decorators/authentication.decorator';
import { User } from '../../user/entities/user.entity';
import { LikeService } from '../services/like.service';

@Controller('likes')
export class LikeController {

  constructor(private readonly likeService: LikeService) {}

  @Post("/song/:songId")
  public async likeSong(@Param("songId") songId: string, @Authentication() user: User): Promise<boolean> {
    return this.likeService.likeSong(songId, user);
  }

  @Post("/playlist/:playlistId")
  public async likePlaylist(@Param("playlistId") playlistId: string, @Authentication() user: User): Promise<boolean> {
    return this.likeService.likePlaylist(playlistId, user)
  }

  @Post("/album/:albumId")
  public async likeAlbum(@Param("albumId") albumId: string, @Authentication() user: User): Promise<boolean> {
    return this.likeService.likeAlbum(albumId, user)
  }

}
