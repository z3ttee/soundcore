import { GeniusType } from "../enums/genius-type.enum";
import { GeniusArtistDTO } from "./genius-artist.dto";
import { GeniusCustomPerformance } from "./genius-song.dto";

export class GeniusAlbumDTO {

    public id: string;
    public name: string;
    public url: string;
    public _type: GeniusType;
    public cover_art_thumbnail_url: string;
    public artist: GeniusArtistDTO;
    public header_image_url: string;
    public description_preview: string;
    
    public release_date: Date;
    public performance_groups: GeniusCustomPerformance[];

}