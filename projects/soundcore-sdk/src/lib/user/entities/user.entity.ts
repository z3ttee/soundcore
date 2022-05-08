import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";

export class User implements SCDKResource {
    public id: string;
    public resourceType: SCDKResourceType;
    public username: string;
    public slug: string;
    public roles: string[];
    public createdAt: Date;
    public updatedAt: Date;

    public friendsCount: number;
    public playlistCount: number;
}