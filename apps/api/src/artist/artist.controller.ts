import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Authentication } from '../authentication/decorators/authentication.decorator';
import { Roles } from '../authentication/decorators/role.decorator';
import { ROLE_ADMIN, ROLE_MOD } from '../constants';
import { User } from '../user/entities/user.entity';
import { ArtistService } from './artist.service';
import { CreateArtistDTO } from './dtos/create-artist.dto';
import { UpdateArtistDTO } from './dtos/update-artist.dto';

@Controller('artists')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  // TODO: Functionality to trigger artist search on genius

  @Get(":artistId")
  public async findProfileById(@Param("artistId") artistId: string) {
    return this.artistService.findProfileById(artistId)
  }

  @Roles(ROLE_MOD, ROLE_ADMIN)
  @Post(":artistId")
  public async createArtist(@Body() createArtistDto: CreateArtistDTO) {
    return this.artistService.createIfNotExists(createArtistDto);
  }

  @Roles(ROLE_MOD, ROLE_ADMIN)
  @Put(":artistId")
  public async updateById(@Param("artistId") artistId: string, @Body() updateArtistDto: UpdateArtistDTO) {
    return this.artistService.updateArtist(artistId, updateArtistDto);
  }

  @Roles(ROLE_MOD, ROLE_ADMIN)
  @Delete(":artistId")
  public async deleteById(@Param("artistId") artistId: string) {
    return this.artistService.deleteById(artistId);
  }

}
