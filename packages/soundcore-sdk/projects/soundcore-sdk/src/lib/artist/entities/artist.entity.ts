import { Album } from "../../album/entities/album.entity";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { Song } from "../../song/entities/song.entity";
import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";

export class Artist implements SCDKResource {
    public resourceType: SCDKResourceType;
    
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