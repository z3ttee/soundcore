import { Artwork } from "../../artwork/entities/artwork.entity";
import { User } from "../../user/entities/user.entity";
import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";
import { PlaylistPrivacy } from "../enums/playlist-privacy.enum";

export class Playlist implements SCDKResource {
    public resourceType: SCDKResourceType;

    // General playlist metadata
    public id: string;
    public name: string;
    public description?: string;
    public privacy?: PlaylistPrivacy;
    public createdAt: Date;
    public slug: string;
    public author?: User;
    public artwork?: Artwork;
    public liked?: boolean = false;

    // Statistical metadata that also is not always available
    public songsCount?: number = 0;
    public collaboratorsCount?: number = 0;
    public totalDuration?: number = 0;
}