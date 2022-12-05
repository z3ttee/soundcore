import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";
import { ArtworkID } from "../../artwork/entities/artwork.entity";
import { Song } from "../../song/entities/song.entity";

export class IndexerResultDTO {

    constructor(
        public readonly entries: IndexerResultEntry[],
        public readonly createdResources: IndexerCreatedResources,
        public readonly timeTookMs: number
    ) {}

}

export class IndexerResultEntry {

    constructor(
        public readonly filepath: string,
        public readonly timeTookMs: number
    ) {}

}

export class IndexerCreatedResources {

    constructor(
        public readonly songs: Song[] = [],
        public readonly albums: Album[] = [],
        public readonly artists: Artist[] = [],
        public readonly artworks: string[] = []
    ) {}

}