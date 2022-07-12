import { PlaylistPrivacy } from "../entities/playlist.entity";

export class CreatePlaylistDTO {
    public title: string;
    public description?: string;
    public privacy?: PlaylistPrivacy;
}