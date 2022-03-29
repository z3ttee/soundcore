import { Artist } from "src/app/features/artist/entities/artist.entity";
import { Artwork } from "src/app/model/artwork.model";
import { Distributor } from "src/app/model/distributor.entity";
import { Label } from "src/app/model/label.model";
import { Publisher } from "src/app/model/publisher.model";
import { Song } from "../../song/entities/song.entity";

export class Album {

    public id: string;
    public title: string;
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

}