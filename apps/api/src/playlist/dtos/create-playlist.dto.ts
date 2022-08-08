import { IsEnum, IsNotEmpty, IsOptional, Length } from "class-validator";
import { PlaylistPrivacy } from "../enums/playlist-privacy.enum";

export class CreatePlaylistDTO {

    @IsNotEmpty()
    @Length(3, 120)
    public title: string;

    @IsOptional()
    @Length(0, 254)
    public description?: string;

    @IsOptional()
    @IsEnum(PlaylistPrivacy)
    public privacy?: PlaylistPrivacy;

}