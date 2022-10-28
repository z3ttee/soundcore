import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Pageable, Pagination } from 'nestjs-pager';
import { Authentication } from '../authentication/decorators/authentication.decorator';
import { User } from '../user/entities/user.entity';
import { AddSongDTO } from './dtos/add-song.dto';
import { CreatePlaylistDTO } from './dtos/create-playlist.dto';
import { UpdatePlaylistDTO } from './dtos/update-playlist.dto';
import { PlaylistService } from './playlist.service';

@Controller('playlists')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Get("@me") 
  public async findByAuthentication(@Authentication() authentication: User) {
    return this.playlistService.findAllByAuthenticatedUser(authentication);
  }

  @Get(":playlistId") 
  public async findPlaylistById(@Param("playlistId") playlistId: string, @Authentication() requester: User) {
    return this.playlistService.findPlaylistProfileById(playlistId, requester);
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

  @Get("/byGenre/:genreId") 
  public async findByGenre(@Param("genreId") genreId: string, @Pagination() pageable: Pageable, @Authentication() authentication: User) {
    return this.playlistService.findByGenre(genreId, pageable, authentication);
  }

  @Post() 
  public async createPlaylist(@Body() createPlaylistDto: CreatePlaylistDTO, @Authentication() author: User) {
    return this.playlistService.create(createPlaylistDto, author);
  }

  @Put(":playlistId") 
  public async updatePlaylist(@Param("playlistId") playlistId: string, @Body() updatePlaylistDto: UpdatePlaylistDTO, @Authentication() requester: User) {
    return this.playlistService.update(playlistId, updatePlaylistDto, requester);
  }

  
}
