import { ResourceType } from "../../utils/entities/resource";
import { MeiliArtwork } from "./meili-artwork.entity";

export class MeiliDistributor {

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly slug: string,
        public readonly resourceType: ResourceType,    
        public readonly artwork: MeiliArtwork
    ) {}

}