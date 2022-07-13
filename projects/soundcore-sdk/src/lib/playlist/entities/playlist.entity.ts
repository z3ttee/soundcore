import { Artwork } from "../../artwork/entities/artwork.entity";
import { User } from "../../user/entities/user.entity";
import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";
import { PlaylistPrivacy } from "../enums/playlist-privacy.enum";

export type PlaylistID = string;
export class Playlist implements SCDKResource {
    public resourceType: SCDKResourceType;

    // General playlist metadata
    public id: PlaylistID;
    public name: string;
    public description?: string;
    public privacy?: PlaylistPrivacy;
    // TODO: public collaborative: boolean;
    public createdAt: Date;
    public slug: string;
    public author?: User;
    public artwork?: Artwork;
    public liked?: boolean = false;

    // Metadata that is not included on every query
    // TODO: public collaborators?: User[];

    // Statistical metadata that also is not always available
    public songsCount?: number = 0;
    public collaboratorsCount?: number = 0;
    public totalDuration?: number = 0;
}