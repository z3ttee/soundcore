import { Album } from "src/app/model/album.model";
import { Artist } from "src/app/model/artist.model";
import { Artwork } from "src/app/model/artwork.model";
import { Distributor } from "src/app/model/distributor.entity";
import { Genre } from "src/app/model/genre.entity";
import { Label } from "src/app/model/label.model";
import { Publisher } from "src/app/model/publisher.model";

export class Song {

    public id: string;
    public geniusUrl: string;
    public title: string;
    public duration: number;
    public location: string;
    public youtubeUrl: string;
    public youtubeUrlStart: string;
    public released: Date;
    public createdAt: Date;
    public explicit: boolean;
    public description: string;

    public artwork?: Artwork;
    public banner?: Artwork;

    public artists?: Artist[];
    public publisher?: Publisher;
    public distributor?: Distributor;
    public label?: Label;
    public albums?: Album[];
    public genres?: Genre[];

    public song2playlist?: Date;
    public streamCount?: number;

}