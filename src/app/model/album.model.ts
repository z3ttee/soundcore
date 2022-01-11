import { Song } from "../features/song/entities/song.entity";
import { Artist } from "./artist.model";
import { Artwork } from "./artwork.model";
import { Distributor } from "./distributor.entity";
import { Label } from "./label.model";
import { Publisher } from "./publisher.model";

export class Album {

    public id: string;
    public title: string;
    public released: Date;
    public description: string;

    public artists?: Artist[];
    public songs?: Song[];
    public artwork?: Artwork;
    public banner?: Artwork;
    public distributor?: Distributor;
    public label?: Label;
    public publisher?: Publisher;

}