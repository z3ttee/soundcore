import { Artwork } from "../../artwork/entities/artwork.entity";
import { PlayableEntity, PlayableEntityType } from "../../tracklist/entities/playable.entity";
import { User } from "../../user/entities/user.entity";
import { PlaylistPrivacy } from "../enums/playlist-privacy.enum";

export class Playlist implements PlayableEntity {
    public type: PlayableEntityType = PlayableEntityType.PLAYLIST;

    // General playlist metadata
    public id: string;
    public name: string;
    public description?: string;
    public privacy: PlaylistPrivacy;
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