import { Artist } from "../artist/entities/artist.entity";

/**
 * Class to handle either create
 * or update events for artists.
 */
export class ArtistChangedEvent {

    constructor(
        public readonly data: Artist
    ) {}

}