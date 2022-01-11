import { Song } from "../features/song/entities/song.entity";
import { Artwork } from "./artwork.model";

export class Label {

    public id: string;
    public name: string;

    public songs?: Song[];
    public artwork?: Artwork;

}