import { SCDKResourceType } from "../../utils/entities/resource";
import { MeiliArtwork } from "./meili-artwork.entity";

export class MeiliArtist {

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly slug: string,
        public readonly description: string,
        public readonly resourceType: SCDKResourceType,
        public readonly createdAt: Date,
        public readonly artwork: MeiliArtwork
    ) {}

}