import { PlaylistPrivacy } from "../enums/playlist-privacy.enum";

export class CreatePlaylistDTO {
    public title: string;
    public description?: string;
    public privacy?: PlaylistPrivacy;
}