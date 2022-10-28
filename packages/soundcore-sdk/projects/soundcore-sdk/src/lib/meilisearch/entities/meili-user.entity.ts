import { SCDKResourceType } from "../../utils/entities/resource";
import { MeiliArtwork } from "./meili-artwork.entity";

export class MeiliUser {

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly slug: string,
        public readonly accentColor: string,
        public readonly resourceType: SCDKResourceType,
        public readonly artwork: MeiliArtwork
    ) {}

}