import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";

export class User implements SCDKResource {
    public id: string;
    public resourceType: SCDKResourceType;
    public username: string;
    public roles: string[];
}