import { Controller, Get, Param, Query } from '@nestjs/common';
import { Authentication } from '../../authentication/decorators/authentication.decorator';
import { User } from '../../user/entities/user.entity';
import { TracklistV2 } from '../entities/tracklist.entity';
import { TracklistV2Service } from '../services/tracklist-v2.service';

/**
 * Controller class that contains
 * endpoints for handling tracklists.
 */
@Controller({
    path: "tracklists",
    version: "2"
})
export class TracklistV2Controller {

    constructor(
        private readonly service: TracklistV2Service
    ) {}

    /**
     * Find a tracklist by an album
     * @param albumId Album's id
     * @param authentication Authentication object
     * @returns Tracklist
     */
    @Get("/album/:albumId")
    public async findListByAlbum(@Param("albumId") albumId: string, @Authentication() authentication: User, @Query("shuffled") shuffled?: string): Promise<TracklistV2> {
        return this.service.findTracklistByAlbumId(albumId, authentication, shuffled === "true");
    }

}
