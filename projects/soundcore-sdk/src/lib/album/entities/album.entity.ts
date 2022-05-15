import { Artist } from "../../artist/entities/artist.entity";
import { Artwork } from "../../artwork/entities/artwork.entity";
import { Distributor } from "../../distributor/entities/distributor.entity";
import { Label } from "../../label/entities/label.entity";
import { Publisher } from "../../publisher/entities/publisher.entity";
import { Song } from "../../song/entities/song.entity";
import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";

export type AlbumID = string;
export class Album implements SCDKResource {
    public resourceType: SCDKResourceType;

    public id: AlbumID;
    public name: string;
    public released: Date;
    public description: string;
    public slug: string;

    public artist?: Artist;

    public songs?: Song[];
    public artwork?: Artwork;
    public banner?: Artwork;
    public distributor?: Distributor;
    public label?: Label;
    public publisher?: Publisher;

    public featuredArtists?: Artist[];
    public songsCount?: number;
    public totalDuration?: number;

    public liked?: boolean;
}