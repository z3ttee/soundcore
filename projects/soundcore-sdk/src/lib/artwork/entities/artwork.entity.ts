import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";

export type ArtworkID = string;
export class Artwork implements SCDKResource {
    public resourceType: SCDKResourceType;
    public id: ArtworkID;
    public accentColor: string;
    public name: null;
}