import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { PlayableEntity, PlayableEntityType } from "../../tracklist/entities/playable.entity";

export class Song implements PlayableEntity {
    public type: PlayableEntityType;

    public slug: string;
    
    public id: string;
    public name: string;
    public duration: number;
    public released: Date;
    public description: string;
    public explicit: boolean;
    public youtubeUrl: string;

    public artwork: Artwork;
    public primaryArtist: Artist;
    public featuredArtists: Artist[];
    public album: Album;

    public streamCount: number;
    public liked: boolean;
    public likedAt: Date;
}