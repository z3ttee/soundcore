import { Artist } from "./artist.model";
import { Artwork } from "./artwork.model";

export class Song {

    public id: string;
    public title: string;
    public artists: Artist[];

    public durationInSeconds: number;
    public artwork?: Artwork;

}