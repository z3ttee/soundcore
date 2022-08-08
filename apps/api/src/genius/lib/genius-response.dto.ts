import { GeniusAlbumDTO } from "./genius-album.dto";
import { GeniusArtistDTO } from "./genius-artist.dto";
import { GeniusSectionDTO } from "./genius-section.dto";
import { GeniusSongDTO } from "./genius-song.dto";

export type GeniusSearchResponse = { sections: GeniusSectionDTO[], next_page: number };
export type GeniusSongResponse = { song: GeniusSongDTO, next_page: number };
export type GeniusArtistResponse = { artist: GeniusArtistDTO, next_page: number };
export type GeniusAlbumResponse = { album: GeniusAlbumDTO, next_page: number };

export class GeniusReponseDTO<T> {
    public meta: { status: number };
    public response: T;
}