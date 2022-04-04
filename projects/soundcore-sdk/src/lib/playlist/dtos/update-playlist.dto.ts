import { PlaylistPrivacy } from "../entities/playlist.entity";

export class UpdatePlaylistDTO {
    public title?: string;
    public privacy?: PlaylistPrivacy;
}