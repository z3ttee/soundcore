import { IsNotEmpty, IsOptional, Length } from "class-validator";
import { GeniusInfo } from "../../utils/entities/genius.entity";
import { Artist } from "../entities/artist.entity";

export class CreateArtistDTO implements 
    Pick<Artist, "name">, 
    Pick<Artist, "slug">,
    Partial<Pick<Artist, "description">>, 
    Partial<Pick<Artist, "genius">> {

    @IsNotEmpty()
    @Length(3, 254)
    public name: string;

    @IsOptional()
    @Length(3, 4000)
    public description?: string;

    @IsOptional()
    public genius?: GeniusInfo;

    @IsOptional()
    public slug: string;

}