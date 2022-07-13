import { PlaylistPrivacy } from "../enums/playlist-privacy.enum";

export class UpdatePlaylistDTO {
    public title?: string;
    public privacy?: PlaylistPrivacy;
}