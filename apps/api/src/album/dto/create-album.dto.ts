import { IsDate, IsNotEmpty, IsOptional, Length } from "class-validator";
import { Artist } from "../../artist/entities/artist.entity";

export class CreateAlbumDTO {

    @IsNotEmpty()
    @Length(3, 120)
    public name: string;

    @IsOptional()
    public lookupGenius?: boolean;

    @IsOptional()
    public primaryArtist: Artist;

    @IsOptional()
    @IsDate()
    public releasedAt?: Date;

    @IsOptional()
    @Length(3, 4000)
    public description?: string;
    
}