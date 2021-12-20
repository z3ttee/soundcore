import { Artwork } from "./artwork.model";
import { Song } from "./song.model";

export class Artist {

    public id: string;
    public name: string;

    public songs?: Song[];
    public artwork?: Artwork;

}