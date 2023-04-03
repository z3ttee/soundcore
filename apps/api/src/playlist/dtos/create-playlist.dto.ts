import { IsEnum, IsNotEmpty, IsOptional, Length } from "class-validator";
import { PlaylistPrivacy } from "../enums/playlist-privacy.enum";
import { Playlist } from "../entities/playlist.entity";

export class CreatePlaylistDTO implements 
    Pick<Playlist, "name">, 
    Partial<Pick<Playlist, "description" | "privacy">> 
{
    @IsNotEmpty()
    @Length(3, 120)
    public name: string;

    @IsOptional()
    @Length(0, 254)
    public description?: string;

    @IsOptional()
    @IsEnum(PlaylistPrivacy)
    public privacy?: PlaylistPrivacy = PlaylistPrivacy.PUBLIC;
}