import { Artist } from "./artist.model";
import { Song } from "./song.model";

export class Album {

    public id: string;
    public geniusId?: string;
    public title: string;

    public artists?: Artist[];
    public songs?: Song[];

}