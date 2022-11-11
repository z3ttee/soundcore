import { IsNotEmpty, IsOptional, Length } from "class-validator";
import { Artist } from "../entities/artist.entity";

export class UpdateArtistDTO implements 
    Pick<Artist, "name">, 
    Partial<Pick<Artist, "description">>, 
    Partial<Pick<Artist, "geniusId">> {

    @IsNotEmpty()
    @Length(3, 254)
    public name: string;
    
    @IsOptional()
    @Length(3, 4000)
    public description?: string;
    
    @IsOptional()
    public geniusId?: string;

}