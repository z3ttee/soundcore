import { Playlist } from "../entities/playlist.entity";
import { PlaylistPrivacy } from "../enums/playlist-privacy.enum";

export class CreatePlaylistDTO implements 
    Pick<Playlist, "name">, 
    Partial<Pick<Playlist, "description" | "privacy">> 
{
    public name: string;
    public description?: string;
    public privacy?: PlaylistPrivacy;
}