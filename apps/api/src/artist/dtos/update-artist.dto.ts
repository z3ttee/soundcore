import { IsBoolean, IsNotEmpty, IsOptional, Length } from "class-validator";

export class UpdateArtistDTO {

    @IsNotEmpty()
    @Length(3, 254)
    public name: string;

    @IsOptional()
    @Length(3, 4000)
    public description?: string;

    @IsOptional()
    public geniusId?: string;

    @IsOptional()
    @IsBoolean()
    public doGeniusLookup?: boolean;

}