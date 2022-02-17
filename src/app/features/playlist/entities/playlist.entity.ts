import { Artwork } from "src/app/model/artwork.model";
import { Song } from "../../song/entities/song.entity";
import { User } from "../../user/entities/user.entity";
import { PlaylistPrivacy } from "../types/playlist-privacy.types";

export class Playlist {

    public id: string;
    public title: string;
    public description?: string;
    public privacy?: PlaylistPrivacy;
    public collaborative: boolean;
    public createdAt: Date;
    public slug: string;
    public author?: User;

    public artwork?: Artwork;
    public collaborators?: User[];
    public songs?: Song[];

    public songsCount?: number = 0;
    public collaboratorsCount?: number = 0;
    public totalDuration?: number = 0;

    public isLiked?: boolean = false;

}