import { GeniusAlbumDTO } from "./genius-album.dto"
import { GeniusArtistDTO } from "./genius-artist.dto"
import { GeniusSongDTO } from "./genius-song.dto"

export class GeniusSearchPageResultDTO {
    public result: (GeniusArtistDTO | GeniusSongDTO | GeniusAlbumDTO)[]
    public hasNextPage: boolean
}