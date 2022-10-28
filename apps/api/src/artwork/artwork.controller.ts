import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../authentication/decorators/public.decorator';
import { ArtworkService } from './services/artwork.service';

@Controller('artworks')
export class ArtworkController {
  constructor(private readonly artworkService: ArtworkService) {}

  @Get(":artworkId")
  @Public(true)
  public async streamArtwork(@Param("artworkId") artworkId: string, @Res() response: Response) {
    return this.artworkService.streamArtwork(artworkId, response);
  }
}
