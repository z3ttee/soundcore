import { IsNotEmpty, IsOptional, Length } from "class-validator";

export class UpdateGenreDTO {

    @IsNotEmpty()
    @Length(3, 120)
    public name: string;

    @IsOptional()
    @Length(0, 254)
    public description?: string;

    @IsOptional()
    public geniusId?: string;
    
}