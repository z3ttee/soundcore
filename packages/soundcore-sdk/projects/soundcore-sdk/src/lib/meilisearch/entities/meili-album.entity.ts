import { SCDKResourceType } from "../../utils/entities/resource";
import { MeiliArtist } from "./meili-artist.entity";
import { MeiliArtwork } from "./meili-artwork.entity";

export class MeiliAlbum {

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly slug: string,
        public readonly resourceType: SCDKResourceType,    
        public readonly releasedAt: Date,
        public readonly createdAt: Date,
        public readonly artwork: MeiliArtwork,
        public readonly primaryArtist: MeiliArtist
    ) {}

}