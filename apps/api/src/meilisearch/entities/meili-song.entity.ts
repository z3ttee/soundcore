import { ResourceType } from "../../utils/entities/resource";
import { MeiliAlbum } from "./meili-album.entity";
import { MeiliArtist } from "./meili-artist.entity";
import { MeiliArtwork } from "./meili-artwork.entity";
import { MeiliGenre } from "./meili-genre.entity";

export class MeiliSong {

    constructor(
        public id: string,
        public name: string,
        public slug: string,
        public duration: number,
        public explicit: boolean,
        public resourceType: ResourceType,    
        public releasedAt: Date,
        public createdAt: Date,
        public artwork: MeiliArtwork,
        public primaryArtist: MeiliArtist,
        public featuredArtists: MeiliArtist[],
        public album: MeiliAlbum,
        public genres: MeiliGenre[],
        public available: boolean
    ) {}

}