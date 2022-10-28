import { Artwork } from "../../artwork/entities/artwork.entity";
import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";

export class User implements SCDKResource {
    public resourceType: SCDKResourceType = "user";

    public id: string;
    public slug: string;
    public name: string;
    public accentColor?: string;
    public artwork?: Artwork;
    
    public createdAt?: Date;
    public updatedAt?: Date;

    public friendsCount? = 0;
    public playlistCount? = 0;

    public roles: string[] = [];
}