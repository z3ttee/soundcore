import { IsNotEmpty, IsOptional, Length } from "class-validator";
import { GeniusInfo } from "../../utils/entities/genius.entity";
import { Artist } from "../entities/artist.entity";

export class UpdateArtistDTO implements 
    Pick<Artist, "name">, 
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
    public geniusId?: string;

}