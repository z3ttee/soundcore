import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";
import { Song } from "../../song/entities/song.entity";

export class IndexerResultDTO {

    constructor(
        public readonly entries: IndexerResultEntry[],
        public readonly timeTookMs: number
    ) {}

}

export class IndexerResultEntry {

    constructor(
        public readonly filepath: string,
        public readonly timeTookMs: number,

        public readonly createdSong: Song,
        public readonly createdAlbum: Album = null,
        public readonly createdArtists: Artist[] = [],
    ) {}

}