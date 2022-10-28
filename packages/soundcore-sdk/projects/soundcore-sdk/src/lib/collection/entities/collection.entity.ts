import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";
export class Collection implements SCDKResource {
    public id: string;
    public resourceType: SCDKResourceType;
    public songsCount: number;
    public totalDuration: number;
}