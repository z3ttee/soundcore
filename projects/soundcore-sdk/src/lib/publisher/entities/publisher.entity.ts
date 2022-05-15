import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";

export class Publisher implements SCDKResource {
    public resourceType: SCDKResourceType;
    public name: string;
    public id: string;
}