import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { CreateArtistDTO } from "./dtos/create-artist.dto";
import { UpdateArtistDTO } from "./dtos/update-artist.dto";
import { ArtistService } from "./services/artist.service";

@Controller("artists")
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  // TODO: Functionality to trigger artist search on genius

  @Get(":artistId")
  public async findProfileById(@Param("artistId") artistId: string) {
    return this.artistService.findProfileById(artistId);
  }

  @Post(":artistId")
  public async createArtist(@Body() createArtistDto: CreateArtistDTO) {
    return this.artistService.createIfNotExists([createArtistDto]);
  }

  @Put(":artistId")
  public async updateById(@Param("artistId") artistId: string, @Body() updateArtistDto: UpdateArtistDTO) {
    return this.artistService.updateArtist(artistId, updateArtistDto);
  }

  @Delete(":artistId")
  public async deleteById(@Param("artistId") artistId: string) {
    // return this.artistService.deleteById(artistId);
  }
}
