import { Album } from "./album.model";
import { Artist } from "./artist.model";
import { Artwork } from "./artwork.model";
import { Label } from "./label.model";
import { Publisher } from "./publisher.model";

export class Song {

    public id: string;
    public geniusId?: string;
    public title: string;
    public duration: number;
    public location: string;
    public youtubeUrl: string;
    public released: Date;
    public createdAt: Date;

    public artwork?: Artwork;
    public artists?: Artist[];
    public publisher?: Publisher;
    public label?: Label;
    public albums?: Album[];

}