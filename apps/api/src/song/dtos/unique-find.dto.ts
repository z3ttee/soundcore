import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";

export class SongUniqueFindDTO {
    public name: string;
    public primaryArtist: Artist;
    public featuredArtists: Artist[] = [];
    public duration = 0;
    public album: Album;
}