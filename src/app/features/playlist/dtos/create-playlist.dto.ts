import { PlaylistPrivacy } from "../types/playlist-privacy.types";

export class CreatePlaylistDTO {

    public title: string;

    public description?: string;
    public privacy?: PlaylistPrivacy;
    public collaborative?: boolean;
    public collaborators?: { id: string }[];
    public songs?: { id: string }[];

}