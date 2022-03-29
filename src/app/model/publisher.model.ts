import { Song } from "../features/song/entities/song.entity";
import { Artwork } from "./artwork.model";

export class Publisher {
    public id: string;
    public name: string;
    public slug: string;

    public artwork?: Artwork;
    public songs?: Song[]
}