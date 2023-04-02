import { Album } from "../../album/entities/album.entity";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { Song } from "../../song/entities/song.entity";
import { PlayableEntity, PlayableEntityType } from "../../tracklist/entities/playable.entity";

export class Artist implements PlayableEntity {
    public type: PlayableEntityType;
    
    public id: string;
    public geniusUrl: string;
    public description: string;
    public name: string;
    public registeredAt: Date;
    public slug: string;

    public songs?: Song[];
    public albums?: Album[];
    public banner?: Artwork;
    public artwork?: Artwork;

    public songCount?: number;
    public albumCount?: number;
    public streamCount?: number;
    public likedCount?: number;

}