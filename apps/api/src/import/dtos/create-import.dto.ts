import { IsNotEmpty, IsNumber, IsOptional, IsUrl, Length } from "class-validator";
import { PlaylistPrivacy } from "../../playlist/enums/playlist-privacy.enum";

export class CreateImportDTO {

    @IsNotEmpty()
    @Length(3, 254)
    public url: string;

    @IsOptional()
    @IsNumber()
    public privacy: PlaylistPrivacy;

}