import { SCDKResource } from "../../utils/entities/resource";

export class SearchHistoryEntry {

    public readonly id: string;
    public readonly createdAt: Date = new Date();

    constructor(
        public readonly resource: SCDKResource
    ) {
        this.id = resource.id;
    }

}