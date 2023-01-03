import { GeniusType } from "../enums/genius-type.enum";
import { GeniusAlbumDTO } from "./genius-album.dto";
import { GeniusArtistDTO } from "./genius-artist.dto";
import { GeniusSongDTO } from "./genius-song.dto";

export class GeniusSearchHitDTO {

    public index: GeniusType;
    public type: GeniusType;
    public result: GeniusSongDTO | GeniusArtistDTO | GeniusAlbumDTO

}