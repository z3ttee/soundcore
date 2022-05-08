import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";

export class Label implements SCDKResource {
    public resourceType: SCDKResourceType;
    
    public id: string;
}