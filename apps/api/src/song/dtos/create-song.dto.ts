import { IsArray, IsNotEmpty, IsNumber, IsOptional, Length, Min } from "class-validator";
import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";
import { Artwork, SongArtwork } from "../../artwork/entities/artwork.entity";
import { File } from "../../file/entities/file.entity";
import { Song } from "../entities/song.entity";

export class CreateSongDTO implements
    Pick<Song, "name">,
    Partial<Pick<Song, "description">>,
    Partial<Pick<Song, "duration">>,
    Partial<Pick<Song, "primaryArtist">>,
    Partial<Pick<Song, "file">>,
    Partial<Pick<Song, "album">>,
    Partial<Pick<Song, "order">>,
    Partial<Pick<Song, "featuredArtists">>,
    Partial<Pick<Song, "artwork">>
{

    @IsNotEmpty()
    @Length(3, 254)
    public name: string;

    @IsOptional()
    @Length(3, 4095)
    public description?: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    public duration?: number;

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
    public artwork?: SongArtwork;

}