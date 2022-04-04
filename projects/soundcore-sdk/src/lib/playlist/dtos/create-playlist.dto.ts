import { PlaylistPrivacy } from "../entities/playlist.entity";

export class CreatePlaylistDTO {
    public title: string;
    public privacy?: PlaylistPrivacy;
}