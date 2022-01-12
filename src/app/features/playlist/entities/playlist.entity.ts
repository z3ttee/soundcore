import { Artwork } from "src/app/model/artwork.model";
import { SSOUser } from "src/app/model/sso-user.model";
import { Song } from "../../song/entities/song.entity";
import { PlaylistPrivacy } from "../types/playlist-privacy.types";

export class Playlist {

    public id: string;
    public title: string;
    public description?: string;
    public privacy?: PlaylistPrivacy;
    public collaborative: boolean;
    public author?: SSOUser;

    public artwork?: Artwork;
    public collaborators?: SSOUser[];
    public songs?: Song[];

    public songsCount?: number = 0;
    public collaboratorsCount?: number = 0;
    public totalDuration?: number = 0;

}