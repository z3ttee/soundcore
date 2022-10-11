import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";

export type GenreID = string;
export class Genre implements SCDKResource {
    public resourceType: SCDKResourceType;
    public id: GenreID;
    public name: string;
    public slug: string;
}