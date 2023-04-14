import { Controller, Get, Param, Query } from '@nestjs/common';
import { Authentication } from '../../authentication/decorators/authentication.decorator';
import { User } from '../../user/entities/user.entity';
import { TracklistV2Service } from '../services/tracklist-v2.service';
import { PlayableEntityType } from '../entities/playable.entity';
import { Pageable, Pagination } from '@soundcore/common';

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
     * Find a tracklist by ownerId and ownerType. An owner usually is a resource
     * to which the tracklist belongs. For example this can be an album, artist or 
     * playlists in general
     * @param ownerId Id of the owner resource
     * @param ownerType Type of the owner resource
     * @param pageable Page settings for the first page of tracks in the tracklist
     * @param authentication Authentication object to include data like liked songs etc.
     * @param shuffled If true, a seed will be generated for building a shuffled tracklist
     * @param startWithId Id of an element in the tracklist to start playback at. This will decrement the requested limit by 1 and include the element to the id at the top of the first page
     * @returns Tracklist
     */
    @Get(`/:ownerType/:ownerId`)
    public async findTracklist(@Param("ownerType") ownerType: PlayableEntityType, @Param("ownerId") ownerId: string, @Pagination() pageable: Pageable, @Authentication() authentication: User, @Query("shuffled") shuffled?: "true" | "false", @Query("startWithId") startWithId?: string) {
        return this.service.findTracklist(ownerId, ownerType, pageable, authentication, shuffled === "true", startWithId);
    }

}
