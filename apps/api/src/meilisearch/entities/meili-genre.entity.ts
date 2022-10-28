import { ResourceType } from "../../utils/entities/resource";

export class MeiliGenre {

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly slug: string,
        public readonly resourceType: ResourceType
    ) {}

}