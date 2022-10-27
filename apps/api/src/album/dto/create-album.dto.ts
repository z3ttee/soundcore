import { IsDate, IsNotEmpty, IsOptional, Length } from "class-validator";
import { Artist } from "../../artist/entities/artist.entity";
import { Album } from "../entities/album.entity";

export class CreateAlbumDTO implements 
    Pick<Album, "name">, 
    Pick<Album, "primaryArtist">, 
    Partial<Pick<Album, "releasedAt">>,
    Partial<Pick<Album, "description">>
{

    @IsNotEmpty()
    @Length(3, 120)
    public name: string;

    @IsOptional()
    public primaryArtist: Artist;

    @IsOptional()
    @IsDate()
    public releasedAt?: Date;

    @IsOptional()
    @Length(3, 4000)
    public description?: string;
    
}