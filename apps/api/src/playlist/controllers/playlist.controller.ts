import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Pageable, Pagination } from '@soundcore/common';
import { Authentication } from '../../authentication/decorators/authentication.decorator';
import { PlaylistService } from '../services/playlist.service';
import { User } from '../../user/entities/user.entity';
import { AddSongDTO } from '../dtos/add-song.dto';
import { CreatePlaylistDTO } from '../dtos/create-playlist.dto';

@Controller('playlists')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Get("@me") 
  public async findByAuthentication(@Authentication() authentication: User) {
    return this.playlistService.findAllByAuthenticatedUser(authentication);
  }

  @Get(":playlistId") 
  public async findPlaylistById(@Param("playlistId") playlistId: string, @Authentication() authentication: User) {
    return this.playlistService.findById(playlistId, authentication);
  }

  @Post() 
  public async createPlaylist(@Body() createPlaylistDto: CreatePlaylistDTO, @Authentication() author: User) {
    return this.playlistService.createIfNotExists([createPlaylistDto], author).then((playlists) => playlists[0]);
  }

  @Put(":playlistId") 
  public async updatePlaylist(@Param("playlistId") playlistId: string, @Body() updatePlaylistDto: Partial<CreatePlaylistDTO>, @Authentication() requester: User) {
    return this.playlistService.update(playlistId, updatePlaylistDto, requester);
  }

  @Delete(":playlistId") 
  public async deleteById(@Param("playlistId") playlistId: string, @Authentication() authentication: User) {
    return this.playlistService.deleteById(playlistId, authentication);
  }

  @Put(":playlistId/addSong") 
  public async addSongs(@Param("playlistId") playlistId: string, @Body() addSongDto: AddSongDTO, @Authentication() authentication: User) {
    return this.playlistService.addSong(playlistId, addSongDto, authentication)
  }

  @Put(":playlistId/songs/remove") 
  public async removeSongs(@Param("playlistId") playlistId: string, @Body() songIds: string[], @Authentication() authentication: User) {
    return this.playlistService.removeSongs(playlistId, songIds, authentication)
  }

  @Get("/byAuthor/:authorId") 
  public async findPlaylistsOfUser(@Param("authorId") authorId: string, @Pagination() pageable: Pageable, @Authentication() authentication: User) {
    return this.playlistService.findByAuthor(authorId, pageable, authentication);
  }

  @Get("/byArtist/:artistId") 
  public async findByArtist(@Param("artistId") artistId: string, @Pagination() pageable: Pageable, @Authentication() authentication: User) {
    return this.playlistService.findByArtist(artistId, pageable, authentication);
  }

}
