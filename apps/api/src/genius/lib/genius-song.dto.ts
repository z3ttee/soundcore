import { GeniusAlbumDTO } from "./genius-album.dto";

import { GeniusType } from "../enums/genius-type.enum";
import { GeniusArtistDTO } from "./genius-artist.dto";
import { GeniusTagDTO } from "./genius-tag.dto";
import { GeniusRelationshipDTO } from "./genius-relationship.dto";

export type GeniusCustomPerformance = { label: "Distributor" | "Label" | "Publisher", artists: GeniusArtistDTO[] }

export class GeniusSongDTO {

    public id: string;
    public _type: GeniusType;
    public api_path: string;
    public artist_names: string;
    public title: string;
    public title_with_featured: string;
    public full_title: string;
    public instrumental: boolean;

    /**
     * Banner image url used on the genius website as header.
     */
    public header_image_url: string;

    /**
     * Path on the Genius.com website
     * Example: https://genius.com/<path>
     */
    public path: string;

    /**
     * Url to the lyrics page on Genius.com
     */
    public url: string;

    public song_art_image_thumbnail_url: string;
    public primary_artist: GeniusArtistDTO


    // All properties below this line are only available if the song was requested on /song/ endpoint and not by 
    // performing a search

    public description_preview: string;
    public explicit: boolean;
    public recording_location: string;
    public release_date: Date;
    public youtube_url: string;
    public youtube_start: string;

    public album?: GeniusAlbumDTO;
    public albums?: GeniusAlbumDTO[];

    public custom_performances: GeniusCustomPerformance[];
    public tags: GeniusTagDTO[];

    public featured_artists: GeniusArtistDTO[];

    public song_relationships: GeniusRelationshipDTO[];
}