import { Song } from "../features/song/entities/song.entity";
import { Artwork } from "./artwork.model";

export class Distributor {
    public id: string;
    public name: string;

    public artwork?: Artwork;
    public songs?: Song[]
}