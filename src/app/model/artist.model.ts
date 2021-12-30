import { Album } from "./album.model";
import { Artwork } from "./artwork.model";
import { Song } from "./song.model";

export class Artist {

    public id: string;
    public name: string;
    public registeredAt: Date;

    public artwork?: Artwork;
    public songs?: Song[];
    public albums?: Album[];

}