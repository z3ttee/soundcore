import { IsArray, IsNotEmpty, IsNumber, IsOptional, Length, Min } from "class-validator";
import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { File } from "../../file/entities/file.entity";

export class CreateSongDTO {

    @IsNotEmpty()
    @Length(3, 254)
    public name: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    public duration: number;

    @IsOptional()
    public primaryArtist?: Artist;

    @IsOptional()
    public file?: File;

    @IsOptional()
    public album?: Album;

    @IsOptional()
    @IsNumber()
    @Min(0)
    public order?: number;

    @IsOptional()
    @IsArray()
    public featuredArtists?: Artist[];

    @IsOptional()
    public artwork?: Artwork;

}