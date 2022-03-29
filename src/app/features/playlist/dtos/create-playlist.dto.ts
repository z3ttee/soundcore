import { PlaylistPrivacy } from "../types/playlist-privacy.types";

export class CreatePlaylistDTO {

    public title: string;
    public privacy?: PlaylistPrivacy;
    
}