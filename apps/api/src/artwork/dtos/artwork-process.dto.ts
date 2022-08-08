import { Artwork } from "../entities/artwork.entity";

export class ArtworkProcessDTO {

    constructor(
        public readonly artwork: Artwork,
        public readonly sourceFile: string
    ) {}

}