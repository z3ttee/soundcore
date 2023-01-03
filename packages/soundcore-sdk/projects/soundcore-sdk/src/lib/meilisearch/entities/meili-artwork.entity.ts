import { ArtworkColors } from "../../artwork/entities/artwork.entity";

export class MeiliArtwork {

    constructor(
        public readonly id: string, 
        public readonly colors: ArtworkColors
    ) {}

}